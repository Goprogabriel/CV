import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// A real HTML entry is necessary for direct visits and refreshes on GitHub Pages.
const dist = resolve('dist');
const htmlPath = resolve(dist, 'projects/LetThereBeLight/index.html');
assert.ok(existsSync(htmlPath), 'LetThereBeLight must be emitted at its original URL');
const html = readFileSync(htmlPath, 'utf8');
assert.ok(html.includes('data-start-camera'), 'The project entry must contain the real experience');
assert.ok(!/src="[^"]*\/src\//.test(html), 'The deployed project must reference compiled assets');
const scripts = [...html.matchAll(/src="[^"]*\/assets\/([^"/]+\.js)"/g)];
assert.ok(scripts.length > 0, 'The project must load a compiled entry script');
for (const [, file] of scripts) assert.ok(existsSync(resolve(dist, 'assets', file)), file);
for (const file of [
  'mediapipe/hand_landmarker.task',
  'mediapipe/wasm/vision_wasm_module_internal.js',
  'mediapipe/wasm/vision_wasm_module_internal.wasm',
])
  assert.ok(existsSync(resolve(dist, file)), `Missing hand-tracking asset: ${file}`);
console.log('LetThereBeLight: static route, entry script and hand-tracking assets verified.');
