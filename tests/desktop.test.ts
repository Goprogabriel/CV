import { describe, expect, it } from 'vitest';
import {
  canMove,
  descendants,
  emptyDesktop,
  parseDesktop,
  validateName,
  webDestination,
  type DesktopFile,
} from '../src/desktop';
import { cvByLanguage, cvText, getSections } from '../src/content/cv';
import { resolveCommand } from '../src/commands';
const file = (
  id: string,
  kind: 'folder' | 'text',
  parentId: string | null = null,
  name = id,
): DesktopFile => ({ id, kind, parentId, name, content: '', modified: '2026-09-05' });
describe('local desktop persistence', () => {
  it('round-trips notes, folders, positions, and wallpaper', () => {
    const state = {
      version: 1,
      files: [
        file('ideas', 'folder'),
        {
          ...file('note', 'text', 'ideas', 'Ideas.txt'),
          content: 'Dansk tekst: æøå\nEnglish text.',
        },
      ],
      positions: { projects: { x: 450, y: 125 } },
      wallpaper: 'violet',
    };
    expect(parseDesktop(JSON.stringify(state))).toEqual(state);
  });
  it('recovers from invalid or unavailable saved data', () => {
    for (const raw of [null, '{broken', 'null', '{}', '{"version":2,"files":[]}'])
      expect(parseDesktop(raw)).toEqual(emptyDesktop);
  });
  it('repairs orphan and cyclic folder references', () => {
    const saved = parseDesktop(
      JSON.stringify({
        version: 1,
        files: [
          file('a', 'folder', 'b'),
          file('b', 'folder', 'a'),
          file('orphan', 'text', 'missing'),
        ],
        positions: { bad: { x: 'bad', y: 3 } },
      }),
    );
    expect(saved.files.find((f) => f.id === 'orphan')?.parentId).toBe(null);
    expect(saved.files.some((f) => ['a', 'b'].includes(f.id) && f.parentId === null)).toBe(true);
    expect(saved.positions).toEqual({});
  });
  it('rejects duplicate IDs and malformed files', () => {
    expect(
      parseDesktop(
        JSON.stringify({
          version: 1,
          files: [file('a', 'folder'), file('a', 'text'), { id: 'bad' }, null],
        }),
      ).files,
    ).toHaveLength(1);
  });
});
describe('file operations', () => {
  const files = [
    file('folder', 'folder'),
    file('child', 'folder', 'folder'),
    file('note', 'text', 'child', 'Notes.txt'),
    file('root-note', 'text', null, 'Notes.txt'),
  ];
  it('validates names in their own folder', () => {
    expect(validateName(' Notes.txt ', files, null)).toBe('duplicate');
    expect(validateName('notes.TXT', files, null)).toBe('duplicate');
    expect(validateName('Notes.txt', files, 'folder')).toBe(null);
    expect(validateName('Notes.txt', files, null, 'root-note')).toBe(null);
    for (const name of ['..', 'a/b', 'a\\b', 'a\u0000b'])
      expect(validateName(name, files, null)).toBe('invalid');
    expect(validateName('  ', files, null)).toBe('empty');
  });
  it('prevents moving folders into themselves or descendants', () => {
    expect(canMove(files, 'folder', 'child')).toBe(false);
    expect(canMove(files, 'folder', 'folder')).toBe(false);
    expect(canMove(files, 'note', 'folder')).toBe(true);
    expect(canMove(files, 'note', null)).toBe(false);
    expect(canMove(files, 'note', 'missing')).toBe(false);
  });
  it('collects nested files when deleting a folder', () => {
    expect(descendants(files, 'folder')).toEqual(['folder', 'child', 'note']);
  });
});
describe('browser address and search handling', () => {
  it('creates an encoded Google search without losing punctuation', () => {
    expect(webDestination('React & TypeScript på dansk')).toEqual({
      url: 'https://www.google.com/search?q=React%20%26%20TypeScript%20p%C3%A5%20dansk',
      query: 'React & TypeScript på dansk',
      kind: 'search',
    });
  });
  it('supports Google operators without treating them as executable URLs', () => {
    expect(webDestination('site:github.com React')?.url).toBe(
      'https://www.google.com/search?q=site%3Agithub.com%20React',
    );
    expect(webDestination('React: a tutorial')?.kind).toBe('search');
  });
  it('handles a complete address and a bare domain', () => {
    expect(webDestination('github.com/Goprogabriel')?.url).toBe('https://github.com/Goprogabriel');
    expect(webDestination('https://example.com/path?q=1')?.kind).toBe('url');
  });
  it('rejects executable schemes and credential-bearing URLs', () => {
    for (const input of [
      '',
      'javascript:alert(1)',
      'data:text/html,test',
      'file:///etc/passwd',
      'https://user:password@example.com',
      'https://',
    ])
      expect(webDestination(input)).toBe(null);
  });
});
describe('bilingual CV parity', () => {
  it('preserves stable command IDs and real facts in both languages', () => {
    expect(getSections('da').map((s) => s.id)).toEqual(getSections('en').map((s) => s.id));
    expect(cvByLanguage.da.projects.map((p) => p.id)).toEqual(
      cvByLanguage.en.projects.map((p) => p.id),
    );
    for (const language of ['da', 'en'] as const) {
      const content = cvByLanguage[language];
      const text = cvText(language);
      expect(text).toContain('Gabriel Back');
      expect(text).toContain('600+');
      expect(text).toContain('gaphbahe@gmail.com');
      expect(text).toContain('+45 21 95 62 25');
      for (const project of content.projects) {
        expect(resolveCommand(`/projects ${project.id}`, language)).toEqual({
          type: 'section',
          section: 'projects',
          detail: project.id,
        });
      }
      expect(text).not.toContain('Alex Morgan');
    }
  });
  it('exports translated headings and descriptions', () => {
    expect(cvText('da')).toContain('UDDANNELSE');
    expect(cvText('en')).toContain('EDUCATION');
    expect(cvByLanguage.da.profile.bio[0]).not.toEqual(cvByLanguage.en.profile.bio[0]);
  });
});
