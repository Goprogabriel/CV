import { cv, sections, type Section, type Language } from './content/cv';
export const commands = ['/help', ...sections.map((s) => `/${s.id}`), '/clear'];
export type Result =
  | { type: 'help' | 'error'; message?: string }
  | { type: 'section'; section: Section; detail?: string }
  | { type: 'clear' };
export function resolveCommand(raw: string, language: Language = 'en'): Result {
  const [command, ...args] = raw.trim().toLowerCase().split(/\s+/);
  if (command === '/clear') return { type: 'clear' };
  if (command === '/help') return { type: 'help' };
  const section = sections.find((s) => `/${s.id}` === command)?.id;
  if (!section)
    return {
      type: 'error',
      message:
        language === 'da'
          ? `Ukendt kommando: ${raw.trim()}. Skriv /help for at se mulighederne.`
          : `Command not found: ${raw.trim()}. Try /help to see what’s available.`,
    };
  const detail = args.join(' ');
  if (detail) {
    const items =
      section === 'projects' ? cv.projects : section === 'experience' ? cv.experience : [];
    const item = items.find((p, i) => p.id === detail || String(i + 1) === detail);
    if (!item)
      return {
        type: 'error',
        message:
          language === 'da'
            ? `Intet match. Skriv /${section}, og vælg et resultat.`
            : `No matching item. Use /${section} to browse, then select a result.`,
      };
    return { type: 'section', section, detail: item.id };
  }
  return { type: 'section', section };
}
export function completeCommand(input: string): string[] {
  const value = input.trim().toLowerCase();
  return commands.filter((c) => c.startsWith(value || '/'));
}

export function commandError(raw: string, language: Language) {
  const result = resolveCommand(raw, language);
  return result.type === 'error' ? result.message : '';
}
