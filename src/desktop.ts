export type Point = { x: number; y: number };
export interface DesktopFile {
  id: string;
  kind: 'folder' | 'text';
  name: string;
  parentId: string | null;
  content: string;
  modified: string;
}
export interface DesktopData {
  version: 1;
  files: DesktopFile[];
  positions: Record<string, Point>;
  wallpaper: 'blue' | 'graphite' | 'violet';
}
export const emptyDesktop: DesktopData = {
  version: 1,
  files: [],
  positions: {},
  wallpaper: 'blue',
};
export const storageKey = 'gabriel-desktop-v1';
export const sessionStorageKey = `${storageKey}-session`;
export function parseDesktop(raw: string | null): DesktopData {
  if (!raw) return { ...emptyDesktop, files: [], positions: {} };
  try {
    const value = JSON.parse(raw);
    if (value.version !== 1 || !Array.isArray(value.files)) return { ...emptyDesktop };
    const seen = new Set<string>();
    const files: DesktopFile[] = value.files
      .slice(0, 150)
      .filter((f: DesktopFile) => {
        if (
          !f ||
          typeof f.id !== 'string' ||
          seen.has(f.id) ||
          !['folder', 'text'].includes(f.kind) ||
          typeof f.name !== 'string' ||
          !f.name.trim() ||
          typeof f.content !== 'string' ||
          !(f.parentId === null || typeof f.parentId === 'string')
        )
          return false;
        seen.add(f.id);
        return true;
      })
      .map((f: DesktopFile) => ({
        id: f.id,
        kind: f.kind,
        name: f.name.slice(0, 80),
        parentId: f.parentId,
        content: f.content.slice(0, 100000),
        modified: typeof f.modified === 'string' ? f.modified : new Date().toISOString(),
      }));
    for (const file of files) {
      if (!files.some((f) => f.id === file.parentId && f.kind === 'folder')) file.parentId = null;
      const chain = new Set([file.id]);
      let parent = file.parentId;
      while (parent) {
        if (chain.has(parent)) {
          file.parentId = null;
          break;
        }
        chain.add(parent);
        parent = files.find((f) => f.id === parent)?.parentId ?? null;
      }
    }
    const positions: Record<string, Point> = {};
    for (const [key, p] of Object.entries(value.positions ?? {}) as [string, Point][])
      if (
        p &&
        Number.isFinite(p.x) &&
        Number.isFinite(p.y) &&
        !['__proto__', 'constructor', 'prototype'].includes(key)
      )
        positions[key] = {
          x: Math.max(0, Math.min(10000, p.x)),
          y: Math.max(0, Math.min(10000, p.y)),
        };
    return {
      version: 1,
      files,
      positions,
      wallpaper: ['blue', 'graphite', 'violet'].includes(value.wallpaper)
        ? value.wallpaper
        : 'blue',
    };
  } catch {
    return { ...emptyDesktop, files: [], positions: {} };
  }
}
export function validateName(
  name: string,
  files: DesktopFile[],
  parentId: string | null,
  excludeId?: string,
): 'empty' | 'invalid' | 'duplicate' | null {
  if (!name.trim()) return 'empty';
  if (
    name.trim().length > 80 ||
    /[\\/]/.test(name) ||
    Array.from(name).some((character) => character.charCodeAt(0) < 32) ||
    ['.', '..'].includes(name.trim())
  )
    return 'invalid';
  if (
    files.some(
      (f) =>
        f.parentId === parentId &&
        f.id !== excludeId &&
        f.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase(),
    )
  )
    return 'duplicate';
  return null;
}
export function descendants(files: DesktopFile[], id: string): string[] {
  const ids = [id];
  for (let i = 0; i < ids.length; i++)
    for (const file of files)
      if (file.parentId === ids[i] && !ids.includes(file.id)) ids.push(file.id);
  return ids;
}
export function canMove(files: DesktopFile[], id: string, parentId: string | null): boolean {
  const file = files.find((f) => f.id === id);
  return (
    !!file &&
    (!parentId || files.some((f) => f.id === parentId && f.kind === 'folder')) &&
    !descendants(files, id).includes(parentId ?? '') &&
    !validateName(file.name, files, parentId, id)
  );
}
export function webDestination(
  input: string,
): { url: string; query: string; kind: 'search' | 'url' } | null {
  const value = input.trim();
  if (!value) return null;
  if (/^(javascript|data|file|vbscript|blob|about|mailto|tel):/i.test(value)) return null;
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(value) && !/^https?:\/\//i.test(value)) return null;
  if (/^https?:/i.test(value) && !/^https?:\/\//i.test(value)) return null;
  if (/^https?:\/\//i.test(value) || /^[\w.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(value)) {
    try {
      const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
      return { url: url.href, query: value, kind: 'url' };
    } catch {
      return null;
    }
  }
  return {
    url: `https://www.google.com/search?q=${encodeURIComponent(value)}`,
    query: value,
    kind: 'search',
  };
}
