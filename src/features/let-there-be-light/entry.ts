import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import './experience.css';
import './desktop-theme.css';

const start = document.querySelector<HTMLButtonElement>('[data-start-camera]')!;
const intro = document.querySelector<HTMLElement>('[data-project-intro]')!;
const error = document.querySelector<HTMLElement>('[data-start-error]')!;

start.addEventListener('click', async () => {
  start.disabled = true;
  start.textContent = 'Starting…';
  try {
    await import('./app');
    intro.hidden = true;
    document.querySelector<HTMLElement>('[data-live-content]')!.inert = false;
    document.querySelector<HTMLButtonElement>('[data-settings-open]')!.hidden = false;
  } catch {
    error.textContent = 'The experiment could not load. Check your connection and try again.';
    start.disabled = false;
    start.textContent = 'Try again';
  }
});

// The GPU and camera are released on pagehide. A history restore needs a fresh session.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) window.location.reload();
});
