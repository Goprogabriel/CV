import { useRef, type ReactNode, type PointerEvent } from 'react';
import type { Point } from '../desktop';
export function DesktopIcon({
  id,
  label,
  position,
  selected,
  onOpen,
  onSelect,
  onMove,
  onContext,
  children,
}: {
  id: string;
  label: string;
  position: Point;
  selected: boolean;
  onOpen: () => void;
  onSelect: () => void;
  onMove: (point: Point) => void;
  onContext: (x: number, y: number) => void;
  children: ReactNode;
}) {
  const drag = useRef<{
    x: number;
    y: number;
    origin: Point;
    moved: boolean;
    timer?: ReturnType<typeof setTimeout>;
  } | null>(null);
  const skipClick = useRef(false);
  function start(e: PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return;
    onSelect();
    skipClick.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
    const current = {
      x: e.clientX,
      y: e.clientY,
      origin: position,
      moved: false,
      timer: undefined as ReturnType<typeof setTimeout> | undefined,
    };
    if (e.pointerType === 'touch')
      current.timer = setTimeout(() => {
        skipClick.current = true;
        onContext(current.x, current.y);
        drag.current = null;
      }, 650);
    drag.current = current;
  }
  function end() {
    if (drag.current?.timer) clearTimeout(drag.current.timer);
    if (drag.current?.moved) skipClick.current = true;
    drag.current = null;
  }
  return (
    <button
      className={`desktop-shortcut movable-shortcut ${selected ? 'shortcut-selected' : ''}`}
      data-desktop-icon={id}
      aria-label={label}
      style={{ left: position.x, top: position.y }}
      onPointerDown={start}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.x,
          dy = e.clientY - d.y;
        if (Math.hypot(dx, dy) > 6) d.moved = true;
        if (d.moved) {
          if (d.timer) clearTimeout(d.timer);
          onMove({
            x: Math.max(0, Math.min(innerWidth - 95, d.origin.x + dx)),
            y: Math.max(43, Math.min(innerHeight - 132, d.origin.y + dy)),
          });
        }
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onClick={() => {
        if (skipClick.current) {
          skipClick.current = false;
          return;
        }
        onOpen();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect();
        onContext(e.clientX, e.clientY);
      }}
      onKeyDown={(e) => {
        if (e.altKey && e.key.startsWith('Arrow')) {
          e.preventDefault();
          onMove({
            x: Math.max(
              0,
              Math.min(
                innerWidth - 95,
                position.x + (e.key === 'ArrowRight' ? 10 : e.key === 'ArrowLeft' ? -10 : 0),
              ),
            ),
            y: Math.max(
              43,
              Math.min(
                innerHeight - 132,
                position.y + (e.key === 'ArrowDown' ? 10 : e.key === 'ArrowUp' ? -10 : 0),
              ),
            ),
          });
        }
        if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
          e.preventDefault();
          onContext(position.x + 45, position.y + 40);
        }
      }}
    >
      {children}
      <span className="desktop-icon-label">{label}</span>
    </button>
  );
}
