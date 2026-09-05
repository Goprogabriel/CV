import { describe, expect, it, vi } from 'vitest';
import { completeCommand, resolveCommand } from '../src/commands';
import { cv, cvByLanguage, cvText, downloadCV, sections, sourceURL } from '../src/content/cv';
import { constrainBounds } from '../src/windows';

describe('terminal command navigation', () => {
  it('exposes every CV section through a command', () => {
    for (const section of sections)
      expect(resolveCommand(`/${section.id}`)).toEqual({ type: 'section', section: section.id });
  });
  it('opens every project and experience by ID and one-based index', () => {
    for (const [section, items] of [
      ['projects', cv.projects],
      ['experience', cv.experience],
    ] as const) {
      items.forEach((item, i) => {
        expect(resolveCommand(`/${section} ${item.id}`)).toEqual({
          type: 'section',
          section,
          detail: item.id,
        });
        expect(resolveCommand(`/${section} ${i + 1}`)).toEqual({
          type: 'section',
          section,
          detail: item.id,
        });
      });
    }
  });
  it('normalizes input and rejects unsupported input without executing it', () => {
    expect(resolveCommand('  /PROJECTS   PARTYPAL  ')).toEqual({
      type: 'section',
      section: 'projects',
      detail: 'partypal',
    });
    for (const input of [
      'rm -rf /',
      '<script>alert(1)</script>',
      '/projects unknown',
      '/about 1',
      '/projects 0',
      '/projects 99',
      '/projects atlas;pwd',
    ])
      expect(resolveCommand(input).type).toBe('error');
    expect(resolveCommand('/clear')).toEqual({ type: 'clear' });
    expect(resolveCommand('/help')).toEqual({ type: 'help' });
  });
  it('supports ambiguous and exact tab completion', () => {
    expect(completeCommand('/c')).toEqual(['/contact', '/cv', '/clear']);
    expect(completeCommand('/pr')).toEqual(['/projects']);
    expect(completeCommand('/nope')).toEqual([]);
  });
});

describe('compact CV export', () => {
  it.each(['da', 'en'] as const)(
    'keeps the %s download concise with key facts and contact details',
    (language) => {
      const text = cvText(language);
      const content = cvByLanguage[language];
      expect(text.split(/\s+/).length).toBeLessThan(275);
      for (const value of [
        content.profile.name,
        content.contact.email,
        content.contact.phone,
        sourceURL,
        '600+',
        'PartyPal',
        'BUSBUS',
      ])
        expect(text).toContain(value);
      for (const id of ['nomad', 'estatetool', 'we-are-safe']) {
        const job = content.experience.find((item) => item.id === id)!;
        for (const value of [job.company, job.role, job.period]) expect(text).toContain(value);
      }
      for (const link of content.contact.links) expect(text).toContain(link.url);
      for (const bio of content.profile.bio) expect(text).not.toContain(bio);
      expect(text).not.toContain('undefined');
    },
  );
});

describe('window positioning', () => {
  it('keeps dragged and resized windows within the workspace', () => {
    const viewport = { width: 1440, height: 900 };
    for (const bounds of [
      { x: -200, y: -100, width: 800, height: 600 },
      { x: 1500, y: 950, width: 900, height: 700 },
      { x: 800, y: 500, width: 2500, height: 1300 },
      { x: 70, y: 60, width: 50, height: 40 },
    ]) {
      const result = constrainBounds(bounds, viewport);
      expect(result.x).toBeGreaterThanOrEqual(8);
      expect(result.y).toBeGreaterThanOrEqual(42);
      expect(result.x + result.width).toBeLessThanOrEqual(viewport.width - 8);
      expect(result.y + result.height).toBeLessThanOrEqual(viewport.height - 54);
      expect(result.width).toBeGreaterThanOrEqual(360);
      expect(result.height).toBeGreaterThanOrEqual(280);
    }
  });
  it('fits a narrow viewport after an orientation or size change', () => {
    const result = constrainBounds(
      { x: 550, y: 350, width: 860, height: 590 },
      { width: 320, height: 568 },
    );
    expect(result.width).toBe(304);
    expect(result.x).toBe(8);
    expect(result.y + result.height).toBeLessThanOrEqual(514);
  });
});

describe('CV download', () => {
  it.each(['da', 'en'] as const)(
    'downloads the compact %s CV and cleans up the temporary link',
    async (language) => {
      vi.useFakeTimers();
      const link = { href: '', download: '', hidden: false, click: vi.fn(), remove: vi.fn() };
      const append = vi.fn();
      vi.stubGlobal('document', { createElement: () => link, body: { append } });
      const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-cv');
      const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      try {
        downloadCV(language);
        expect(append).toHaveBeenCalledWith(link);
        expect(link.download).toBe(`gabriel-back-cv-${language}.txt`);
        expect(link.href).toBe('blob:test-cv');
        expect(link.click).toHaveBeenCalledOnce();
        expect(link.remove).toHaveBeenCalledOnce();
        const blob = create.mock.calls[0][0] as Blob;
        expect(await blob.text()).toBe(cvText(language));
        vi.runAllTimers();
        expect(revoke).toHaveBeenCalledWith('blob:test-cv');
      } finally {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        vi.useRealTimers();
      }
    },
  );
});
