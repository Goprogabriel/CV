import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react';
import { Maximize2, Minus, Square, X } from 'lucide-react';
import type { AppId, Section } from '../content/cv';
import { constrainBounds, type Bounds } from '../windows';
import { AppIcon } from './Icons';
import { useLocale } from '../Locale';
export interface WindowState {
  id: string;
  app: AppId;
  nodeId?: string;
  section?: Section;
  minimized: boolean;
  maximized: boolean;
  bounds: Bounds;
  z: number;
}
export function Window({
  state,
  title,
  active,
  onFocus,
  onChange,
  onClose,
  children,
}: {
  state: WindowState;
  title: string;
  active: boolean;
  onFocus: () => void;
  onChange: (patch: Partial<WindowState>) => void;
  onClose: () => void;
  children: ReactNode;
}) {
  const { t } = useLocale();
  const gesture = useRef<{ mode: string; x: number; y: number; bounds: Bounds } | null>(null);
  const element = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!active) element.current?.querySelector<HTMLElement>(':focus')?.blur();
  }, [active]);
  function start(event: PointerEvent, mode: string) {
    if (
      event.button !== 0 ||
      state.maximized ||
      matchMedia('(max-width: 640px)').matches ||
      (event.target as HTMLElement).closest('button')
    )
      return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = { mode, x: event.clientX, y: event.clientY, bounds: state.bounds };
    onFocus();
  }
  function move(event: PointerEvent) {
    const current = gesture.current;
    if (!current) return;
    const dx = event.clientX - current.x,
      dy = event.clientY - current.y;
    const b = current.bounds;
    let next = { ...b };
    if (current.mode === 'move') next = { ...b, x: b.x + dx, y: b.y + dy };
    else {
      if (current.mode.includes('e')) next.width = b.width + dx;
      if (current.mode.includes('s')) next.height = b.height + dy;
      if (current.mode.includes('w')) {
        next.width = Math.max(360, b.width - dx);
        next.x = b.x + b.width - next.width;
      }
      if (current.mode.includes('n')) {
        next.height = Math.max(280, b.height - dy);
        next.y = b.y + b.height - next.height;
      }
    }
    onChange({ bounds: constrainBounds(next, { width: innerWidth, height: innerHeight }) });
  }
  return (
    <section
      ref={element}
      className={`desktop-window ${active ? 'window-active' : ''} ${state.maximized ? 'maximized' : ''} window-${state.app}`}
      role="dialog"
      aria-modal="false"
      aria-label={title}
      data-window={state.id}
      style={{
        left: state.bounds.x,
        top: state.bounds.y,
        width: state.bounds.width,
        height: state.bounds.height,
        zIndex: state.z,
        display: state.minimized ? 'none' : undefined,
      }}
      onPointerDownCapture={onFocus}
      onFocusCapture={() => {
        if (!active) onFocus();
      }}
      onKeyDown={(event) => {
        if (event.altKey && event.key === 'F4') {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <header
        className="window-titlebar"
        onPointerDown={(event) => start(event, 'move')}
        onPointerMove={move}
        onPointerUp={() => {
          gesture.current = null;
        }}
        onPointerCancel={() => {
          gesture.current = null;
        }}
        onDoubleClick={(event) => {
          if (!(event.target as HTMLElement).closest('button'))
            onChange({ maximized: !state.maximized });
        }}
      >
        <div className="window-title">
          <AppIcon id={state.section ?? state.app} size={15} />
          <span>{title}</span>
        </div>
        <div className="window-controls">
          <button
            aria-label={`${t('Minimér', 'Minimize')} ${title}`}
            title={t('Minimér', 'Minimize')}
            onClick={() => onChange({ minimized: true })}
          >
            <Minus size={14} />
          </button>
          <button
            aria-label={`${state.maximized ? t('Gendan', 'Restore') : t('Maksimér', 'Maximize')} ${title}`}
            title={state.maximized ? t('Gendan', 'Restore') : t('Maksimér', 'Maximize')}
            onClick={() => onChange({ maximized: !state.maximized })}
          >
            {state.maximized ? <Maximize2 size={12} /> : <Square size={11} />}
          </button>
          <button
            className="window-close"
            aria-label={`${t('Luk', 'Close')} ${title}`}
            title={t('Luk', 'Close')}
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>
      </header>
      <div className="window-body">{children}</div>
      {!state.maximized &&
        ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map((direction) => (
          <div
            key={direction}
            className={`resize-handle resize-${direction}`}
            onPointerDown={(event) => start(event, direction)}
            onPointerMove={move}
            onPointerUp={() => {
              gesture.current = null;
            }}
            onPointerCancel={() => {
              gesture.current = null;
            }}
            aria-hidden="true"
          />
        ))}
    </section>
  );
}
