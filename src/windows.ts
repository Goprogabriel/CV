export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
export function constrainBounds(
  bounds: Bounds,
  viewport: { width: number; height: number },
): Bounds {
  const width = Math.min(Math.max(360, bounds.width), Math.max(1, viewport.width - 16));
  const height = Math.min(Math.max(280, bounds.height), Math.max(1, viewport.height - 96));
  return {
    width,
    height,
    x: Math.min(Math.max(8, bounds.x), Math.max(8, viewport.width - width - 8)),
    y: Math.min(Math.max(42, bounds.y), Math.max(42, viewport.height - height - 54)),
  };
}
