import { tgpu } from 'typegpu';
import type { TgpuRoot } from 'typegpu';
import { DepthCameraSession } from './camera-session.ts';
import { setupHandTracking } from './hand-tracking.ts';
import { parseDepthBundle } from './inference/bundle.ts';
import { DepthInferencePlan } from './inference/depthart.ts';
import { setupLightInput } from './light-input.ts';
import {
  cachingEnabled,
  clearDownloads,
  fetchModel,
  isModelCached,
  modelLabel,
  modelVariant,
  setCachingEnabled,
} from './model-store.ts';
import {
  LIGHT_Z_MAX,
  LIGHT_Z_MIN,
  DepthRelightingRenderer,
  defaultRelightingSettings,
} from './renderer.ts';

const MODEL_SIZE = 'large' as const;
const CAMERA_FRAME_RATE = 60;

type Facing = 'front' | 'back';
type StatusTone = 'busy' | 'error';

function requiredElement<T extends Element>(element: T | null | undefined, name: string): T {
  if (!element) {
    throw new Error(`LetThereBeLight could not find ${name}.`);
  }
  return element;
}

const app = requiredElement(document.querySelector<HTMLElement>('[data-light-app]'), 'its app');
const canvas = requiredElement(
  app.querySelector<HTMLCanvasElement>('[data-light-canvas]'),
  'the camera canvas',
);
const video = requiredElement(
  app.querySelector<HTMLVideoElement>('[data-light-video]'),
  'the camera video',
);
const handOverlay = requiredElement(
  app.querySelector<HTMLCanvasElement>('[data-hand-overlay]'),
  'the hand overlay',
);
const stage = requiredElement(app.querySelector<HTMLElement>('[data-light-stage]'), 'the stage');
const status = requiredElement(app.querySelector<HTMLElement>('[data-light-status]'), 'the status');
const statusKicker = requiredElement(
  app.querySelector<HTMLElement>('[data-status-kicker]'),
  'the status label',
);
const statusMessage = requiredElement(
  app.querySelector<HTMLElement>('[data-status-message]'),
  'the status message',
);
const retryButton = requiredElement(
  app.querySelector<HTMLButtonElement>('[data-light-retry]'),
  'the retry button',
);
const settingsButton = requiredElement(
  document.querySelector<HTMLButtonElement>('[data-settings-open]'),
  'the settings button',
);
const settingsDialog = requiredElement(
  document.querySelector<HTMLDialogElement>('[data-settings-dialog]'),
  'the settings panel',
);
const settingsClose = settingsDialog?.querySelector<HTMLButtonElement>('[data-settings-close]');
const creditsButton = app?.querySelector<HTMLButtonElement>('[data-credits-open]');
const credits = settingsDialog?.querySelector<HTMLElement>('[data-credits]');
const handStatus = requiredElement(
  app.querySelector<HTMLElement>('[data-hand-status]'),
  'the hand tracking status',
);
const handStatusText = requiredElement(
  handStatus.querySelector<HTMLElement>('b'),
  'the hand tracking status text',
);
const depthMeter = requiredElement(
  app.querySelector<HTMLElement>('[data-depth-meter]'),
  'the light depth meter',
);
const gestureHint = requiredElement(
  app.querySelector<HTMLElement>('[data-gesture-hint]'),
  'the gesture hint',
);

const listenerController = new AbortController();
const { signal } = listenerController;

let root: TgpuRoot | undefined;
let plan: DepthInferencePlan | undefined;
let renderer: DepthRelightingRenderer | undefined;
let booting = false;
let disposed = false;
let deviceLost = false;
let facing: Facing = 'front';
let handWasGrabbed = false;

const visualSettings = {
  intensity: defaultRelightingSettings.intensity,
  bulbSize: defaultRelightingSettings.bulbSize,
  exposure: defaultRelightingSettings.exposure,
  relief: defaultRelightingSettings.relief,
  shadow: defaultRelightingSettings.shadow,
  occlusion: defaultRelightingSettings.occlusion,
  lightColor: [...defaultRelightingSettings.lightColor] as [number, number, number],
};

function errorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return 'Camera access was blocked. Allow camera access in your browser, then try again.';
  }
  if (error instanceof DOMException && error.name === 'NotFoundError') {
    return 'No camera was found on this device.';
  }
  return error instanceof Error ? error.message : String(error);
}

function setStatus(tone: StatusTone, kicker: string, message: string): void {
  stage.dataset.state = tone;
  status.dataset.tone = tone;
  status.hidden = false;
  statusKicker.textContent = kicker;
  statusMessage.textContent = message;
  retryButton.hidden = tone !== 'error';
}

function clearStatus(): void {
  if (status.dataset.tone === 'busy') {
    status.hidden = true;
    stage.dataset.state = 'running';
  }
}

function applyVisualSettings(): void {
  renderer?.update(visualSettings);
}

const light = setupLightInput(
  canvas,
  (update) => {
    renderer?.update(update);
    if (update.lightZ !== undefined) {
      depthMeter.style.setProperty(
        '--light-depth',
        String((update.lightZ - LIGHT_Z_MIN) / (LIGHT_Z_MAX - LIGHT_Z_MIN)),
      );
    }
  },
  signal,
);

const handTracking = setupHandTracking(
  video,
  handOverlay,
  {
    onState: (state, message) => {
      handStatus.dataset.state = state;
      handStatusText.textContent = message;
      light.setHandTrackingActive(state !== 'off' && state !== 'error');
      if (state !== 'tracking') {
        if ((state === 'off' || state === 'error') && handWasGrabbed) {
          light.releaseTrackedLight([0, 0], 0);
          handWasGrabbed = false;
          handStatus.dataset.floating = 'true';
          stage.dataset.lightFloating = 'true';
        }
        handStatus.dataset.grabbed = 'false';
        stage.dataset.lightGrabbed = 'false';
      }
      if (state === 'searching') {
        gestureHint.textContent = 'Pinch directly on the light and hold briefly to catch';
      } else if (state === 'off' || state === 'error') {
        gestureHint.textContent = 'Drag the light with touch or mouse';
      }
    },
    onUpdate: ({
      position,
      lightZ,
      depthProgress,
      grabbed,
      handPresent,
      velocity,
      depthVelocity,
    }) => {
      const justReleased = handWasGrabbed && !grabbed;
      if (handPresent) {
        stage.dataset.handSeen = 'true';
      }
      handStatus.dataset.grabbed = String(grabbed);
      stage.dataset.lightGrabbed = String(grabbed);
      depthMeter.style.setProperty('--light-depth', String(depthProgress));
      if (grabbed) {
        handStatus.dataset.floating = 'false';
        stage.dataset.lightFloating = 'false';
        gestureHint.textContent = 'Light grabbed · move, then release quickly to throw';
        light.setTrackedLight(position, lightZ);
      } else if (justReleased) {
        handStatusText.textContent = 'Light floating · pinch to catch';
        handStatus.dataset.floating = 'true';
        stage.dataset.lightFloating = 'true';
        gestureHint.textContent = 'Light thrown · catch it with a pinch from either hand';
        light.releaseTrackedLight(velocity, depthVelocity);
      } else {
        gestureHint.textContent = 'Pinch directly on the light and hold briefly to catch';
      }
      handWasGrabbed = grabbed;
    },
  },
  signal,
);

void handTracking.init().catch(() => undefined);

const camera = new DepthCameraSession(
  video,
  {
    onFrame: (frame) => {
      if (!renderer || disposed || deviceLost) {
        return;
      }
      try {
        handTracking.setLightState(light.lightPosition, light.lightZ);
        handTracking.sampleFrame(performance.now(), facing === 'front');
        light.orbitTick();
        renderer.render(frame);
        clearStatus();
      } catch (error) {
        camera.stop();
        setStatus('error', 'Rendering stopped', errorMessage(error));
      }
    },
    onError: (error) => {
      if (!disposed && !deviceLost) {
        setStatus('error', 'Camera stopped', errorMessage(error));
      }
    },
    onEnded: () => {
      if (!disposed && !deviceLost) {
        setStatus('error', 'Camera stopped', 'The camera stream ended.');
      }
    },
  },
  { frameRate: CAMERA_FRAME_RATE, facingMode: 'user' },
);

async function attachBundle(bytes: ArrayBuffer): Promise<void> {
  if (!root || disposed || deviceLost) {
    return;
  }
  const bundle = parseDepthBundle(bytes);
  setStatus('busy', 'Building the scene', `Compiling ${bundle.model} pipelines on your GPU…`);
  const nextPlan = new DepthInferencePlan(root, bundle);
  try {
    await nextPlan.initAsync();
    if (disposed || deviceLost) {
      nextPlan.destroy();
      return;
    }
    if (!renderer) {
      const nextRenderer = new DepthRelightingRenderer(root, canvas);
      await nextRenderer.initAsync();
      renderer = nextRenderer;
    }
  } catch (error) {
    nextPlan.destroy();
    throw error;
  }

  renderer.attach(nextPlan);
  plan?.destroy();
  plan = nextPlan;
  renderer.update({
    ...visualSettings,
    lightPosition: light.lightPosition,
    lightZ: light.lightZ,
    mirror: facing === 'front',
  });
  renderer.resetHistory();
}

async function loadLargeModel(hasShaderF16: boolean): Promise<void> {
  const variant = modelVariant(MODEL_SIZE, hasShaderF16);
  if (!variant) {
    throw new Error(
      'The large model needs shader-f16 support. Open this project in a recent Chrome or Edge browser on a WebGPU-capable device.',
    );
  }
  const cached = await isModelCached(variant);
  setStatus(
    'busy',
    cached ? 'Loading from this device' : 'One-time model download',
    `${modelLabel(MODEL_SIZE, variant)} · ${cached ? 'preparing cached model' : 'camera frames stay on your device'}…`,
  );
  await attachBundle(await fetchModel(variant, signal));
}

async function startCamera(): Promise<void> {
  setStatus('busy', 'Camera permission', 'Allow access to start the live relighting camera…');
  renderer?.update({ mirror: facing === 'front' });
  await camera.start();
  renderer?.resetHistory();
}

async function createRoot(): Promise<void> {
  if (!navigator.gpu) {
    throw new Error(
      'WebGPU is not available in this browser. Try a recent version of Chrome, Edge or Safari on a supported device.',
    );
  }
  setStatus('busy', 'Preparing WebGPU', 'Connecting to your device’s graphics processor…');
  const nextRoot = await tgpu.init({
    adapter: { powerPreference: 'high-performance' },
    device: { optionalFeatures: ['shader-f16'] },
  });
  if (disposed) {
    nextRoot.destroy();
    return;
  }
  root = nextRoot;
  void nextRoot.device.lost.then((info) => {
    if (disposed || root !== nextRoot) {
      return;
    }
    deviceLost = true;
    camera.stop();
    setStatus('error', 'GPU connection lost', info.message || String(info.reason));
  });
}

function destroyGpuResources(): void {
  camera.stop();
  renderer?.destroy();
  renderer = undefined;
  plan?.destroy();
  plan = undefined;
  root?.destroy();
  root = undefined;
}

async function boot(): Promise<void> {
  if (booting || disposed) {
    return;
  }
  booting = true;
  retryButton.hidden = true;
  try {
    if (deviceLost) {
      destroyGpuResources();
      deviceLost = false;
    }
    if (!root) {
      await createRoot();
    }
    if (!root || disposed) {
      return;
    }
    if (!plan) {
      await loadLargeModel(root.device.features.has('shader-f16'));
    }
    if (!disposed) {
      await startCamera();
    }
  } catch (error) {
    if (!disposed) {
      setStatus('error', 'Could not start', errorMessage(error));
    }
  } finally {
    booting = false;
  }
}

async function setFacing(nextFacing: Facing): Promise<void> {
  if (facing === nextFacing) {
    return;
  }
  facing = nextFacing;
  handTracking.reset();
  delete stage.dataset.handSeen;
  camera.facingMode = facing === 'front' ? 'user' : 'environment';
  renderer?.update({ mirror: facing === 'front' });
  if (!camera.active) {
    return;
  }
  camera.stop();
  setStatus('busy', 'Switching camera', `Opening the ${facing} camera…`);
  try {
    await camera.start();
    renderer?.resetHistory();
  } catch (error) {
    setStatus('error', 'Could not switch camera', errorMessage(error));
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

const rangeSettings = [
  ['intensity', 'intensity'],
  ['bulbSize', 'bulbSize'],
  ['ambient', 'exposure'],
  ['relief', 'relief'],
  ['shadow', 'shadow'],
  ['occlusion', 'occlusion'],
] as const;

for (const [controlName, settingName] of rangeSettings) {
  const input = settingsDialog.querySelector<HTMLInputElement>(`[data-setting="${controlName}"]`);
  const output = settingsDialog.querySelector<HTMLOutputElement>(`[data-output="${controlName}"]`);
  input?.addEventListener(
    'input',
    () => {
      visualSettings[settingName] = input.valueAsNumber;
      if (output) {
        output.value = input.valueAsNumber.toFixed(2).replace(/\.00$/, '');
      }
      applyVisualSettings();
    },
    { signal },
  );
}

const colorInput = settingsDialog.querySelector<HTMLInputElement>('[data-setting="color"]');
colorInput?.addEventListener(
  'input',
  () => {
    visualSettings.lightColor = hexToRgb(colorInput.value);
    applyVisualSettings();
  },
  { signal },
);

const handToggle = settingsDialog.querySelector<HTMLInputElement>('[data-hand-toggle]');
handToggle?.addEventListener(
  'change',
  () => {
    handTracking.setEnabled(handToggle.checked);
    if (handToggle.checked) {
      delete stage.dataset.handSeen;
    }
  },
  { signal },
);

for (const radio of settingsDialog.querySelectorAll<HTMLInputElement>('[name="camera-facing"]')) {
  radio.addEventListener('change', () => {
    if (radio.checked) {
      void setFacing(radio.value as Facing);
    }
  }, { signal });
}

const cacheToggle = settingsDialog.querySelector<HTMLInputElement>('[data-cache-toggle]');
const clearCacheButton = settingsDialog.querySelector<HTMLButtonElement>('[data-clear-cache]');
if (cacheToggle) {
  cacheToggle.checked = cachingEnabled();
  cacheToggle.addEventListener('change', () => setCachingEnabled(cacheToggle.checked), { signal });
}
clearCacheButton?.addEventListener(
  'click',
  async () => {
    await clearDownloads();
    clearCacheButton.textContent = 'Download cleared';
    window.setTimeout(() => {
      clearCacheButton.textContent = 'Clear downloaded model';
    }, 1800);
  },
  { signal },
);

settingsDialog.querySelector<HTMLButtonElement>('[data-settings-reset]')?.addEventListener(
  'click',
  () => {
    const defaults: Record<string, number> = {
      intensity: defaultRelightingSettings.intensity,
      bulbSize: defaultRelightingSettings.bulbSize,
      ambient: defaultRelightingSettings.exposure,
      relief: defaultRelightingSettings.relief,
      shadow: defaultRelightingSettings.shadow,
      occlusion: defaultRelightingSettings.occlusion,
    };
    for (const [controlName, settingName] of rangeSettings) {
      const input = settingsDialog.querySelector<HTMLInputElement>(`[data-setting="${controlName}"]`);
      const output = settingsDialog.querySelector<HTMLOutputElement>(`[data-output="${controlName}"]`);
      const value = defaults[controlName];
      if (!input || value === undefined) {
        continue;
      }
      input.value = String(value);
      visualSettings[settingName] = value;
      if (output) {
        output.value = value.toFixed(2).replace(/\.00$/, '');
      }
    }
    if (colorInput) {
      colorInput.value = '#ffb875';
    }
    visualSettings.lightColor = [...defaultRelightingSettings.lightColor];
    applyVisualSettings();
  },
  { signal },
);

function openSettings(showCredits = false): void {
  if (!settingsDialog.open) {
    settingsDialog.showModal();
  }
  document.body.classList.add('dialog-open');
  settingsButton.setAttribute('aria-expanded', 'true');
  if (showCredits && credits) {
    requestAnimationFrame(() => {
      credits.scrollIntoView({ block: 'nearest' });
      credits.focus({ preventScroll: true });
    });
  }
}

function closeSettings(): void {
  if (settingsDialog.open) {
    settingsDialog.close();
  }
}

settingsButton.addEventListener('click', () => openSettings(), { signal });
settingsClose?.addEventListener('click', closeSettings, { signal });
creditsButton?.addEventListener('click', () => openSettings(true), { signal });
settingsDialog.addEventListener(
  'click',
  (event) => {
    if (event.target === settingsDialog) {
      closeSettings();
    }
  },
  { signal },
);
settingsDialog.addEventListener(
  'close',
  () => {
    document.body.classList.remove('dialog-open');
    settingsButton.setAttribute('aria-expanded', 'false');
  },
  { signal },
);

retryButton.addEventListener('click', () => void boot(), { signal });

function cleanup(): void {
  if (disposed) {
    return;
  }
  disposed = true;
  listenerController.abort();
  handTracking.destroy();
  camera.destroy();
  destroyGpuResources();
}

window.addEventListener('pagehide', cleanup, { once: true });
void boot();
