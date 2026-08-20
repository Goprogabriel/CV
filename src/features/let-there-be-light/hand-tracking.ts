import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { LIGHT_Z_MAX, LIGHT_Z_MIN, defaultRelightingSettings } from './renderer.ts';

const SAMPLE_INTERVAL = 1000 / 15;
const POSITION_SMOOTHING = 0.36;
const DEPTH_SMOOTHING = 0.22;
const DEPTH_RESPONSE = 1.8;

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
] as const;

interface Point {
  readonly x: number;
  readonly y: number;
  readonly z?: number;
  readonly visibility?: number;
}

interface PendingFrame {
  readonly width: number;
  readonly height: number;
  readonly mirrored: boolean;
}

type TrackingState = 'loading' | 'searching' | 'tracking' | 'off' | 'error';

interface TrackingUpdate {
  readonly position: [number, number];
  readonly lightZ: number;
  readonly depthProgress: number;
}

interface HandTrackingCallbacks {
  readonly onState: (state: TrackingState, message: string) => void;
  readonly onUpdate: (update: TrackingUpdate) => void;
}

interface WorkerReadyMessage {
  readonly type: 'ready';
}

interface WorkerResultMessage {
  readonly type: 'result';
  readonly landmarks: NormalizedLandmark[][];
}

interface WorkerErrorMessage {
  readonly type: 'error' | 'frame-error';
  readonly message: string;
}

type WorkerMessage = WorkerReadyMessage | WorkerResultMessage | WorkerErrorMessage;

export interface HandTrackingController {
  readonly enabled: boolean;
  init(): Promise<void>;
  setEnabled(enabled: boolean): void;
  sampleFrame(timestamp: number, mirrored: boolean): void;
  reset(): void;
  destroy(): void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function mix(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

function distance(first: Point, second: Point): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function canvasPoint(
  point: Point,
  frame: PendingFrame,
): Point {
  const side = Math.min(frame.width, frame.height);
  const cropX = (frame.width - side) * 0.5;
  const cropY = (frame.height - side) * 0.5;
  let x = (point.x * frame.width - cropX) / side;
  if (frame.mirrored) {
    x = 1 - x;
  }
  return {
    x,
    y: (point.y * frame.height - cropY) / side,
    z: point.z,
    visibility: point.visibility,
  };
}

export function setupHandTracking(
  video: HTMLVideoElement,
  overlay: HTMLCanvasElement,
  callbacks: HandTrackingCallbacks,
  signal: AbortSignal,
): HandTrackingController {
  const context = overlay.getContext('2d');
  const worker = new Worker(new URL('./hand-tracking.worker.ts', import.meta.url), {
    type: 'module',
  });
  const publicBase = import.meta.env.BASE_URL;
  const baseUrl = new URL(publicBase, window.location.origin);
  const wasmBaseUrl = new URL('mediapipe/wasm', baseUrl).href.replace(/\/$/, '');
  const modelUrl = new URL('mediapipe/hand_landmarker.task', baseUrl).href;

  let isEnabled = true;
  let initialized = false;
  let initializing: Promise<void> | undefined;
  let resolveInitialization: (() => void) | undefined;
  let rejectInitialization: ((error: Error) => void) | undefined;
  let pending = false;
  let pendingFrame: PendingFrame | undefined;
  let lastSample = -Infinity;
  let disposed = false;
  let referencePalmScale: number | undefined;
  let smoothedPosition: [number, number] | undefined;
  let smoothedDepth = defaultRelightingSettings.lightZ;

  function clearOverlay(): void {
    context?.clearRect(0, 0, overlay.width, overlay.height);
  }

  function syncOverlaySize(): void {
    const size = Math.min(1024, Math.max(1, Math.round(overlay.clientWidth * Math.min(2, devicePixelRatio || 1))));
    if (overlay.width !== size || overlay.height !== size) {
      overlay.width = size;
      overlay.height = size;
    }
  }

  function drawHand(points: readonly Point[]): void {
    if (!context) {
      return;
    }
    syncOverlaySize();
    context.clearRect(0, 0, overlay.width, overlay.height);
    context.save();
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = 'rgba(243, 240, 232, .88)';
    context.lineWidth = Math.max(2, overlay.width * 0.0028);
    context.shadowColor = 'rgba(4, 21, 18, .8)';
    context.shadowBlur = overlay.width * 0.012;

    for (const [fromIndex, toIndex] of HAND_CONNECTIONS) {
      const from = points[fromIndex];
      const to = points[toIndex];
      if (!from || !to) {
        continue;
      }
      context.beginPath();
      context.moveTo(from.x * overlay.width, from.y * overlay.height);
      context.lineTo(to.x * overlay.width, to.y * overlay.height);
      context.stroke();
    }

    context.shadowBlur = 0;
    for (const [index, point] of points.entries()) {
      const isTip = index === 4 || index === 8 || index === 12 || index === 16 || index === 20;
      context.beginPath();
      context.arc(
        point.x * overlay.width,
        point.y * overlay.height,
        overlay.width * (isTip ? 0.007 : 0.0034),
        0,
        Math.PI * 2,
      );
      context.fillStyle = index === 8 ? '#d96949' : 'rgba(243, 240, 232, .95)';
      context.fill();
    }

    const fingertip = points[8];
    if (fingertip) {
      context.beginPath();
      context.arc(
        fingertip.x * overlay.width,
        fingertip.y * overlay.height,
        overlay.width * 0.021,
        0,
        Math.PI * 2,
      );
      context.strokeStyle = 'rgba(217, 105, 73, .8)';
      context.lineWidth = Math.max(1, overlay.width * 0.0015);
      context.stroke();
    }
    context.restore();
  }

  function processHand(landmarks: readonly NormalizedLandmark[], frame: PendingFrame): void {
    const points = landmarks.map((point) => canvasPoint(point, frame));
    const fingertip = points[8];
    const wrist = points[0];
    const indexKnuckle = points[5];
    const middleKnuckle = points[9];
    const pinkyKnuckle = points[17];
    if (!fingertip || !wrist || !indexKnuckle || !middleKnuckle || !pinkyKnuckle) {
      return;
    }

    const palmWidth = distance(indexKnuckle, pinkyKnuckle);
    const palmLength = distance(wrist, middleKnuckle);
    const palmScale = Math.sqrt(Math.max(0.0001, palmWidth * palmLength));
    referencePalmScale ??= palmScale;

    const targetPosition: [number, number] = [
      clamp(fingertip.x, 0, 1),
      clamp(fingertip.y, 0, 1),
    ];
    if (!smoothedPosition) {
      smoothedPosition = targetPosition;
    } else {
      smoothedPosition = [
        mix(smoothedPosition[0], targetPosition[0], POSITION_SMOOTHING),
        mix(smoothedPosition[1], targetPosition[1], POSITION_SMOOTHING),
      ];
    }

    const targetDepth = clamp(
      defaultRelightingSettings.lightZ + Math.log(palmScale / referencePalmScale) * DEPTH_RESPONSE,
      LIGHT_Z_MIN,
      LIGHT_Z_MAX,
    );
    smoothedDepth = mix(smoothedDepth, targetDepth, DEPTH_SMOOTHING);
    drawHand(points);
    callbacks.onState('tracking', 'Hand control · live');
    callbacks.onUpdate({
      position: smoothedPosition,
      lightZ: smoothedDepth,
      depthProgress: (smoothedDepth - LIGHT_Z_MIN) / (LIGHT_Z_MAX - LIGHT_Z_MIN),
    });
  }

  function handleMessage(event: MessageEvent<WorkerMessage>): void {
    const message = event.data;
    if (message.type === 'ready') {
      initialized = true;
      initializing = undefined;
      callbacks.onState(isEnabled ? 'searching' : 'off', isEnabled ? 'Show one hand' : 'Hand control · off');
      resolveInitialization?.();
      resolveInitialization = undefined;
      rejectInitialization = undefined;
      return;
    }

    if (message.type === 'error') {
      pending = false;
      initializing = undefined;
      const error = new Error(message.message);
      callbacks.onState('error', 'Hand control unavailable');
      rejectInitialization?.(error);
      resolveInitialization = undefined;
      rejectInitialization = undefined;
      return;
    }

    pending = false;
    if (message.type === 'frame-error') {
      callbacks.onState('error', 'Hand control paused');
      return;
    }
    if (message.type !== 'result') {
      return;
    }
    if (!isEnabled || !pendingFrame) {
      return;
    }
    const hand = message.landmarks[0];
    if (!hand) {
      clearOverlay();
      callbacks.onState('searching', 'Show one hand');
      return;
    }
    processHand(hand, pendingFrame);
  }

  worker.addEventListener('message', handleMessage, { signal });
  worker.addEventListener(
    'error',
    () => {
      pending = false;
      initializing = undefined;
      callbacks.onState('error', 'Hand control unavailable');
      rejectInitialization?.(new Error('The hand tracking worker stopped.'));
    },
    { signal },
  );

  function init(): Promise<void> {
    if (initialized) {
      return Promise.resolve();
    }
    if (initializing) {
      return initializing;
    }
    callbacks.onState('loading', 'Loading hand control');
    initializing = new Promise<void>((resolve, reject) => {
      resolveInitialization = resolve;
      rejectInitialization = reject;
      worker.postMessage({ type: 'init', modelUrl, wasmBaseUrl });
    });
    return initializing;
  }

  function reset(): void {
    pendingFrame = undefined;
    referencePalmScale = undefined;
    smoothedPosition = undefined;
    smoothedDepth = defaultRelightingSettings.lightZ;
    clearOverlay();
    callbacks.onState(isEnabled ? 'searching' : 'off', isEnabled ? 'Show one hand' : 'Hand control · off');
  }

  function setEnabled(enabled: boolean): void {
    isEnabled = enabled;
    if (!enabled) {
      pendingFrame = undefined;
      clearOverlay();
      callbacks.onState('off', 'Hand control · off');
      return;
    }
    if (!initialized) {
      void init().catch(() => undefined);
      return;
    }
    callbacks.onState('searching', 'Show one hand');
  }

  function sampleFrame(timestamp: number, mirrored: boolean): void {
    if (
      disposed ||
      !isEnabled ||
      !initialized ||
      pending ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      timestamp - lastSample < SAMPLE_INTERVAL
    ) {
      return;
    }
    pending = true;
    lastSample = timestamp;
    void createImageBitmap(video)
      .then((bitmap) => {
        if (disposed || !isEnabled) {
          bitmap.close();
          pending = false;
          return;
        }
        pendingFrame = { width: bitmap.width, height: bitmap.height, mirrored };
        worker.postMessage({ type: 'frame', bitmap, timestamp: Math.round(timestamp) }, [bitmap]);
      })
      .catch(() => {
        pending = false;
        callbacks.onState('error', 'Hand control unavailable');
      });
  }

  function destroy(): void {
    if (disposed) {
      return;
    }
    disposed = true;
    clearOverlay();
    worker.postMessage({ type: 'dispose' });
    worker.terminate();
  }

  signal.addEventListener('abort', destroy, { once: true });

  return {
    get enabled() {
      return isEnabled;
    },
    init,
    setEnabled,
    sampleFrame,
    reset,
    destroy,
  };
}
