import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { LIGHT_Z_MAX, LIGHT_Z_MIN, defaultRelightingSettings } from './renderer.ts';

const SAMPLE_INTERVAL = 1000 / 20;
const POSITION_SMOOTHING = 0.48;
const DEPTH_SMOOTHING = 0.28;
const DEPTH_RESPONSE = 1.8;
const PINCH_GRAB_RATIO = 0.36;
const PINCH_RELEASE_RATIO = 0.64;
const CATCH_RADIUS = 0.11;
const CATCH_CONFIRM_FRAMES = 3;
const CATCH_CONFIRM_TIME = 110;
const CANDIDATE_WRIST_TOLERANCE = 0.14;
const CANDIDATE_POINT_TOLERANCE = 0.09;
const MIN_PALM_SCALE = 0.035;
const LOST_HAND_RELEASE_FRAMES = 4;
const VELOCITY_SMOOTHING = 0.42;
const MAX_THROW_VELOCITY = 1.8;
const MAX_DEPTH_VELOCITY = 2.2;

interface Point {
  readonly x: number;
  readonly y: number;
  readonly z?: number;
  readonly visibility?: number;
}

interface PendingFrame {
  readonly timestamp: number;
  readonly width: number;
  readonly height: number;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  readonly mirrored: boolean;
}

type TrackingState = 'loading' | 'searching' | 'tracking' | 'off' | 'error';

interface TrackingUpdate {
  readonly position: [number, number];
  readonly lightZ: number;
  readonly depthProgress: number;
  readonly grabbed: boolean;
  readonly handPresent: boolean;
  readonly velocity: [number, number];
  readonly depthVelocity: number;
}

interface TrackedHand {
  readonly wrist: Point;
  readonly thumbTip: Point;
  readonly indexTip: Point;
  readonly pinchPoint: Point;
  readonly palmScale: number;
  readonly pinchRatio: number;
}

interface GrabSample {
  readonly timestamp: number;
  readonly position: readonly [number, number];
  readonly depth: number;
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
  setLightState(position: readonly [number, number], depth: number): void;
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

function screenDistance(first: Point, second: Point, frame: PendingFrame): number {
  const aspect = frame.viewportWidth / Math.max(1, frame.viewportHeight);
  return Math.hypot((first.x - second.x) * aspect, first.y - second.y);
}

function canvasPoint(point: Point, frame: PendingFrame): Point {
  const coverScale = Math.max(
    frame.viewportWidth / frame.width,
    frame.viewportHeight / frame.height,
  );
  const visibleWidth = frame.viewportWidth / coverScale;
  const visibleHeight = frame.viewportHeight / coverScale;
  const cropX = (frame.width - visibleWidth) * 0.5;
  const cropY = (frame.height - visibleHeight) * 0.5;
  let x = (point.x * frame.width - cropX) / visibleWidth;
  if (frame.mirrored) {
    x = 1 - x;
  }
  return {
    x,
    y: (point.y * frame.height - cropY) / visibleHeight,
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
  let grabbed = false;
  let activeWrist: Point | undefined;
  let grabReferencePalmScale: number | undefined;
  let grabReferenceDepth = defaultRelightingSettings.lightZ;
  let lostHandFrames = 0;
  let smoothedPosition: [number, number] = [...defaultRelightingSettings.lightPosition];
  let smoothedDepth = defaultRelightingSettings.lightZ;
  let throwVelocity: [number, number] = [0, 0];
  let throwDepthVelocity = 0;
  let previousGrabSample: GrabSample | undefined;
  let catchTarget: [number, number] = [...defaultRelightingSettings.lightPosition];
  let candidateWrist: Point | undefined;
  let candidatePoint: Point | undefined;
  let candidateFrames = 0;
  let candidateStartedAt = 0;

  function clearOverlay(): void {
    context?.clearRect(0, 0, overlay.width, overlay.height);
  }

  function syncOverlaySize(): void {
    const ratio = Math.min(2, devicePixelRatio || 1);
    const requestedWidth = Math.max(1, Math.round(overlay.clientWidth * ratio));
    const requestedHeight = Math.max(1, Math.round(overlay.clientHeight * ratio));
    const limitScale = Math.min(1, 1024 / Math.max(requestedWidth, requestedHeight));
    const width = Math.max(1, Math.round(requestedWidth * limitScale));
    const height = Math.max(1, Math.round(requestedHeight * limitScale));
    if (overlay.width !== width || overlay.height !== height) {
      overlay.width = width;
      overlay.height = height;
    }
  }

  function drawHands(
    hands: readonly TrackedHand[],
    activeIndex: number,
    catchConfirmation: number,
  ): void {
    if (!context) {
      return;
    }
    syncOverlaySize();
    const drawingUnit = Math.min(overlay.width, overlay.height);
    context.clearRect(0, 0, overlay.width, overlay.height);

    hands.forEach((hand, handIndex) => {
      const isActive = handIndex === activeIndex;
      const pinchProgress = 1 - clamp(
        (hand.pinchRatio - PINCH_GRAB_RATIO) / (PINCH_RELEASE_RATIO - PINCH_GRAB_RATIO),
        0,
        1,
      );
      context.save();
      context.globalAlpha = isActive ? 1 : 0.4;
      context.shadowColor = 'rgba(4, 21, 18, .7)';
      context.shadowBlur = drawingUnit * 0.012;
      for (const point of [hand.thumbTip, hand.indexTip]) {
        context.beginPath();
        context.arc(
          point.x * overlay.width,
          point.y * overlay.height,
          drawingUnit * (isActive ? 0.006 : 0.004),
          0,
          Math.PI * 2,
        );
        context.fillStyle = isActive ? '#e47b58' : 'rgba(243, 240, 232, .55)';
        context.fill();
      }

      if (isActive) {
        const ringRadius = drawingUnit * mix(0.029, 0.014, pinchProgress);
        context.beginPath();
        context.arc(
          hand.pinchPoint.x * overlay.width,
          hand.pinchPoint.y * overlay.height,
          ringRadius,
          0,
          Math.PI * 2,
        );
        context.strokeStyle = grabbed ? '#fff4df' : 'rgba(228, 123, 88, .9)';
        context.lineWidth = Math.max(2, drawingUnit * (grabbed ? 0.0035 : 0.002));
        context.setLineDash(grabbed ? [] : [drawingUnit * 0.008, drawingUnit * 0.006]);
        context.shadowColor = grabbed ? 'rgba(255, 184, 117, .95)' : 'rgba(217, 105, 73, .45)';
        context.shadowBlur = drawingUnit * (grabbed ? 0.035 : 0.014);
        context.stroke();

        if (!grabbed && catchConfirmation > 0) {
          context.beginPath();
          context.arc(
            hand.pinchPoint.x * overlay.width,
            hand.pinchPoint.y * overlay.height,
            ringRadius + drawingUnit * 0.008,
            -Math.PI * 0.5,
            -Math.PI * 0.5 + Math.PI * 2 * catchConfirmation,
          );
          context.setLineDash([]);
          context.strokeStyle = '#fff4df';
          context.lineWidth = Math.max(2, drawingUnit * 0.003);
          context.shadowColor = 'rgba(255, 184, 117, .9)';
          context.shadowBlur = drawingUnit * 0.026;
          context.stroke();
        }
      }
      context.restore();
    });
  }

  function toTrackedHand(
    landmarks: readonly NormalizedLandmark[],
    frame: PendingFrame,
  ): TrackedHand | undefined {
    const points = landmarks.map((point) => canvasPoint(point, frame));
    const wrist = points[0];
    const thumbTip = points[4];
    const indexKnuckle = points[5];
    const indexTip = points[8];
    const middleKnuckle = points[9];
    const pinkyKnuckle = points[17];
    if (!wrist || !thumbTip || !indexKnuckle || !indexTip || !middleKnuckle || !pinkyKnuckle) {
      return undefined;
    }

    const palmWidth = distance(indexKnuckle, pinkyKnuckle);
    const palmLength = distance(wrist, middleKnuckle);
    const palmScale = Math.sqrt(Math.max(0.0001, palmWidth * palmLength));
    return {
      wrist,
      thumbTip,
      indexTip,
      pinchPoint: {
        x: (thumbTip.x + indexTip.x) * 0.5,
        y: (thumbTip.y + indexTip.y) * 0.5,
      },
      palmScale,
      pinchRatio: distance(thumbTip, indexTip) / Math.max(0.0001, palmScale),
    };
  }

  function emitUpdate(handPresent = true): void {
    callbacks.onUpdate({
      position: smoothedPosition,
      lightZ: smoothedDepth,
      depthProgress: (smoothedDepth - LIGHT_Z_MIN) / (LIGHT_Z_MAX - LIGHT_Z_MIN),
      grabbed,
      handPresent,
      velocity: [...throwVelocity],
      depthVelocity: throwDepthVelocity,
    });
  }

  function resetCatchCandidate(): void {
    candidateWrist = undefined;
    candidatePoint = undefined;
    candidateFrames = 0;
    candidateStartedAt = 0;
  }

  function releaseLight(): void {
    grabbed = false;
    activeWrist = undefined;
    grabReferencePalmScale = undefined;
    previousGrabSample = undefined;
    resetCatchCandidate();
  }

  function processHands(
    landmarkHands: readonly (readonly NormalizedLandmark[])[],
    frame: PendingFrame,
  ): void {
    const hands = landmarkHands
      .map((landmarks) => toTrackedHand(landmarks, frame))
      .filter((hand): hand is TrackedHand => hand !== undefined);

    if (hands.length === 0) {
      lostHandFrames += 1;
      clearOverlay();
      if (grabbed && lostHandFrames <= LOST_HAND_RELEASE_FRAMES) {
        callbacks.onState('tracking', 'Keep the pinch in view');
        return;
      }
      releaseLight();
      callbacks.onState('searching', 'Show a hand · pinch to catch');
      emitUpdate(false);
      return;
    }

    lostHandFrames = 0;
    let activeIndex = 0;
    const firstHand = hands[0];
    if (!firstHand) {
      return;
    }

    if (grabbed && activeWrist) {
      const previousWrist = activeWrist;
      let closestDistance = Number.POSITIVE_INFINITY;
      hands.forEach((hand, index) => {
        const wristDistance = distance(hand.wrist, previousWrist);
        if (wristDistance < closestDistance) {
          closestDistance = wristDistance;
          activeIndex = index;
        }
      });
    } else {
      const targetPoint: Point = { x: catchTarget[0], y: catchTarget[1] };
      let activeIsPinching = firstHand.pinchRatio <= PINCH_RELEASE_RATIO;
      let closestDistance = screenDistance(firstHand.pinchPoint, targetPoint, frame);
      hands.forEach((hand, index) => {
        const handIsPinching = hand.pinchRatio <= PINCH_RELEASE_RATIO;
        const catchDistance = screenDistance(hand.pinchPoint, targetPoint, frame);
        if (
          (handIsPinching && !activeIsPinching) ||
          (handIsPinching === activeIsPinching && catchDistance < closestDistance)
        ) {
          activeIsPinching = handIsPinching;
          closestDistance = catchDistance;
          activeIndex = index;
        }
      });
    }

    const activeHand = hands[activeIndex];
    if (!activeHand) {
      return;
    }

    let catchConfirmation = 0;
    let trackingMessage = 'Pinch close to the light to catch it';
    if (!grabbed) {
      const targetPoint: Point = { x: catchTarget[0], y: catchTarget[1] };
      const catchDistance = screenDistance(activeHand.pinchPoint, targetPoint, frame);
      const pinchVisible =
        activeHand.pinchPoint.x >= 0 &&
        activeHand.pinchPoint.x <= 1 &&
        activeHand.pinchPoint.y >= 0 &&
        activeHand.pinchPoint.y <= 1;
      const deliberateCatch =
        activeHand.pinchRatio <= PINCH_GRAB_RATIO &&
        activeHand.palmScale >= MIN_PALM_SCALE &&
        pinchVisible &&
        catchDistance <= CATCH_RADIUS;

      if (deliberateCatch) {
        const sameCandidate =
          candidateWrist !== undefined &&
          candidatePoint !== undefined &&
          distance(activeHand.wrist, candidateWrist) <= CANDIDATE_WRIST_TOLERANCE &&
          screenDistance(activeHand.pinchPoint, candidatePoint, frame) <= CANDIDATE_POINT_TOLERANCE;
        if (sameCandidate) {
          candidateFrames += 1;
        } else {
          candidateFrames = 1;
          candidateStartedAt = frame.timestamp;
        }
        candidateWrist = activeHand.wrist;
        candidatePoint = activeHand.pinchPoint;
        const heldFor = frame.timestamp - candidateStartedAt;
        catchConfirmation = Math.min(
          1,
          candidateFrames / CATCH_CONFIRM_FRAMES,
          heldFor / CATCH_CONFIRM_TIME,
        );
        trackingMessage = 'Hold the pinch · confirming catch';

        if (candidateFrames >= CATCH_CONFIRM_FRAMES && heldFor >= CATCH_CONFIRM_TIME) {
          grabbed = true;
          activeWrist = activeHand.wrist;
          grabReferencePalmScale = activeHand.palmScale;
          grabReferenceDepth = smoothedDepth;
          throwVelocity = [0, 0];
          throwDepthVelocity = 0;
          smoothedPosition = [
            clamp(activeHand.pinchPoint.x, 0, 1),
            clamp(activeHand.pinchPoint.y, 0, 1),
          ];
          previousGrabSample = {
            timestamp: frame.timestamp,
            position: smoothedPosition,
            depth: smoothedDepth,
          };
          resetCatchCandidate();
        }
      } else {
        resetCatchCandidate();
        if (activeHand.palmScale < MIN_PALM_SCALE) {
          trackingMessage = 'Move your hand closer to catch';
        } else if (activeHand.pinchRatio <= PINCH_GRAB_RATIO) {
          trackingMessage = 'Move the pinch onto the light';
        }
      }
    } else if (activeHand.pinchRatio >= PINCH_RELEASE_RATIO) {
      releaseLight();
    }

    if (grabbed) {
      activeWrist = activeHand.wrist;
      const targetPosition: [number, number] = [
        clamp(activeHand.pinchPoint.x, 0, 1),
        clamp(activeHand.pinchPoint.y, 0, 1),
      ];
      const nextPosition: [number, number] = [
        mix(smoothedPosition[0], targetPosition[0], POSITION_SMOOTHING),
        mix(smoothedPosition[1], targetPosition[1], POSITION_SMOOTHING),
      ];

      const referenceScale = grabReferencePalmScale ?? activeHand.palmScale;
      const targetDepth = clamp(
        grabReferenceDepth + Math.log(activeHand.palmScale / referenceScale) * DEPTH_RESPONSE,
        LIGHT_Z_MIN,
        LIGHT_Z_MAX,
      );
      const nextDepth = mix(smoothedDepth, targetDepth, DEPTH_SMOOTHING);
      if (previousGrabSample) {
        const elapsed = (frame.timestamp - previousGrabSample.timestamp) / 1000;
        if (elapsed > 0.01 && elapsed < 0.25) {
          const measuredX = clamp(
            (nextPosition[0] - previousGrabSample.position[0]) / elapsed,
            -MAX_THROW_VELOCITY,
            MAX_THROW_VELOCITY,
          );
          const measuredY = clamp(
            (nextPosition[1] - previousGrabSample.position[1]) / elapsed,
            -MAX_THROW_VELOCITY,
            MAX_THROW_VELOCITY,
          );
          const measuredDepth = clamp(
            (nextDepth - previousGrabSample.depth) / elapsed,
            -MAX_DEPTH_VELOCITY,
            MAX_DEPTH_VELOCITY,
          );
          throwVelocity = [
            mix(throwVelocity[0], measuredX, VELOCITY_SMOOTHING),
            mix(throwVelocity[1], measuredY, VELOCITY_SMOOTHING),
          ];
          throwDepthVelocity = mix(
            throwDepthVelocity,
            measuredDepth,
            VELOCITY_SMOOTHING,
          );
        }
      }
      smoothedPosition = nextPosition;
      smoothedDepth = nextDepth;
      previousGrabSample = {
        timestamp: frame.timestamp,
        position: smoothedPosition,
        depth: smoothedDepth,
      };
    }

    drawHands(hands, activeIndex, catchConfirmation);
    callbacks.onState('tracking', grabbed ? 'Light grabbed · release to throw' : trackingMessage);
    emitUpdate();
  }

  function handleMessage(event: MessageEvent<WorkerMessage>): void {
    const message = event.data;
    if (message.type === 'ready') {
      initialized = true;
      initializing = undefined;
      callbacks.onState(
        isEnabled ? 'searching' : 'off',
        isEnabled ? 'Show a hand · pinch to catch' : 'Hand control · off',
      );
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
    if (message.type !== 'result' || !isEnabled || !pendingFrame) {
      return;
    }
    processHands(message.landmarks, pendingFrame);
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
    releaseLight();
    lostHandFrames = 0;
    throwVelocity = [0, 0];
    throwDepthVelocity = 0;
    smoothedPosition = [...defaultRelightingSettings.lightPosition];
    smoothedDepth = defaultRelightingSettings.lightZ;
    clearOverlay();
    callbacks.onState(
      isEnabled ? 'searching' : 'off',
      isEnabled ? 'Show a hand · pinch to catch' : 'Hand control · off',
    );
  }

  function setEnabled(enabled: boolean): void {
    isEnabled = enabled;
    if (!enabled) {
      pendingFrame = undefined;
      releaseLight();
      clearOverlay();
      callbacks.onState('off', 'Hand control · off');
      return;
    }
    if (!initialized) {
      void init().catch(() => undefined);
      return;
    }
    callbacks.onState('searching', 'Show a hand · pinch to catch');
  }

  function setLightState(position: readonly [number, number], depth: number): void {
    catchTarget = [clamp(position[0], 0, 1), clamp(position[1], 0, 1)];
    if (!grabbed) {
      smoothedDepth = clamp(depth, LIGHT_Z_MIN, LIGHT_Z_MAX);
    }
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
        pendingFrame = {
          timestamp,
          width: bitmap.width,
          height: bitmap.height,
          viewportWidth: Math.max(1, overlay.clientWidth),
          viewportHeight: Math.max(1, overlay.clientHeight),
          mirrored,
        };
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
    setLightState,
    sampleFrame,
    reset,
    destroy,
  };
}
