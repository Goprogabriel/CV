import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

interface InitMessage {
  readonly type: 'init';
  readonly modelUrl: string;
  readonly wasmBaseUrl: string;
}

interface FrameMessage {
  readonly type: 'frame';
  readonly bitmap: ImageBitmap;
  readonly timestamp: number;
}

interface DisposeMessage {
  readonly type: 'dispose';
}

type HandTrackingMessage = InitMessage | FrameMessage | DisposeMessage;

interface WorkerScope {
  onmessage: ((event: MessageEvent<HandTrackingMessage>) => void) | null;
  postMessage(message: unknown): void;
  close(): void;
}

const workerScope = self as unknown as WorkerScope;
let landmarker: HandLandmarker | undefined;

async function initialize(message: InitMessage): Promise<void> {
  const vision = await FilesetResolver.forVisionTasks(message.wasmBaseUrl, true);
  const modelResponse = await fetch(message.modelUrl);
  if (!modelResponse.ok) {
    throw new Error(`Hand model download failed (${modelResponse.status}).`);
  }

  landmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetBuffer: new Uint8Array(await modelResponse.arrayBuffer()),
      // DepthART already occupies WebGPU. CPU inference in this worker keeps
      // MediaPipe from competing for another graphics context.
      delegate: 'CPU',
    },
    runningMode: 'VIDEO',
    numHands: 2,
    minHandDetectionConfidence: 0.55,
    minHandPresenceConfidence: 0.52,
    minTrackingConfidence: 0.5,
  });
}

function serializeLandmarks(landmarks: NormalizedLandmark[][]): NormalizedLandmark[][] {
  return landmarks.map((hand) => hand.map(({ x, y, z, visibility }) => ({ x, y, z, visibility })));
}

workerScope.onmessage = (event) => {
  const message = event.data;

  if (message.type === 'init') {
    void initialize(message)
      .then(() => workerScope.postMessage({ type: 'ready' }))
      .catch((error: unknown) => {
        workerScope.postMessage({
          type: 'error',
          message: error instanceof Error ? error.message : String(error),
        });
      });
    return;
  }

  if (message.type === 'dispose') {
    landmarker?.close();
    landmarker = undefined;
    workerScope.close();
    return;
  }

  if (message.type === 'frame') {
    try {
      if (!landmarker) {
        throw new Error('Hand tracking is not ready.');
      }
      const result = landmarker.detectForVideo(message.bitmap, message.timestamp);
      workerScope.postMessage({
        type: 'result',
        landmarks: serializeLandmarks(result.landmarks),
      });
    } catch (error) {
      workerScope.postMessage({
        type: 'frame-error',
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      message.bitmap.close();
    }
  }
};
