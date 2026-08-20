# Third-party notices

## TypeGPU — Monocular Light Injection example

The implementation in `src/features/let-there-be-light/` is adapted from the
[TypeGPU Monocular Light Injection example](https://github.com/software-mansion/TypeGPU/tree/main/apps/typegpu-docs/src/examples/image-processing/monocular-light-injection)
at commit `186a026c36ac55268377dac3bb233c19c0410f06`.

MIT License

Copyright (c) 2025 Software Mansion <swmansion.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Google MediaPipe Tasks Vision

Hand tracking in `src/features/let-there-be-light/` uses
[`@mediapipe/tasks-vision` 1.0.1](https://www.npmjs.com/package/@mediapipe/tasks-vision)
and the official
[`hand_landmarker` float16 model](https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task).
The WebAssembly runtime and model are stored in `public/mediapipe/` so the
experience works from the static GitHub Pages deployment.

Copyright 2026 Google LLC.

Licensed under the Apache License, Version 2.0. You may obtain a copy of the
license at <https://www.apache.org/licenses/LICENSE-2.0>.

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
