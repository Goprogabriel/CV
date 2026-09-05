import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  ChevronRight,
  Command,
  CornerDownLeft,
  FolderOpen,
  Terminal as TerminalIcon,
} from 'lucide-react';
import { downloadCV, type Section } from '../content/cv';
import { completeCommand, resolveCommand, commandError, type Result } from '../commands';
import { useLocale } from '../Locale';
import { SectionContent } from './Content';

type Entry = { id: number; command: string; result: Result };
function ResultList({
  section,
  run,
  returnToPrompt,
  active,
}: {
  section: 'projects' | 'experience';
  run: (command: string) => void;
  returnToPrompt: () => void;
  active: boolean;
}) {
  const { cv, t } = useLocale();
  const items =
    section === 'projects'
      ? cv.projects.map((p) => ({ id: p.id, name: p.name, description: p.summary, meta: p.year }))
      : cv.experience.map((e) => ({
          id: e.id,
          name: e.company,
          description: e.role,
          meta: e.period,
        }));
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    if (active) buttons.current[0]?.focus({ preventScroll: true });
  }, [active]);
  function keyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      buttons.current[
        (index + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length
      ]?.focus();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      returnToPrompt();
    }
  }
  return (
    <div className="terminal-results" role="group" aria-label={`${section} results`}>
      <div className="result-heading">
        <span>
          {items.length} {t('resultater', 'results')}
        </span>
        <span>{t('↑↓ vælg · Enter åbn · Esc prompt', '↑↓ select · Enter open · Esc prompt')}</span>
      </div>
      {items.map((item, index) => (
        <button
          key={item.id}
          ref={(el) => {
            buttons.current[index] = el;
          }}
          onKeyDown={(event) => keyDown(event, index)}
          onClick={() => run(`/${section} ${item.id}`)}
        >
          <ChevronRight size={14} />
          <span className="result-index">0{index + 1}</span>
          <span className="result-name">
            {item.name}
            <small>{item.description}</small>
          </span>
          <span className="result-meta">{item.meta}</span>
          <CornerDownLeft size={13} />
        </button>
      ))}
    </div>
  );
}
function Help({ run }: { run: (command: string) => void }) {
  const { sections, t } = useLocale();
  return (
    <div className="help-list">
      {[
        ...sections.map((s) => ({ command: `/${s.id}`, description: s.description })),
        {
          command: '/help',
          description: t('Kommandoer & tastaturgenveje', 'All commands & keyboard shortcuts'),
        },
        { command: '/clear', description: t('Ryd terminalen', 'Clear the terminal') },
      ].map((c) => (
        <button key={c.command} onClick={() => run(c.command)}>
          <span>{c.command}</span>
          <span>{c.description}</span>
          <ArrowRight size={13} />
        </button>
      ))}
      <p>
        {t(
          'I kommandofeltet: ↑↓ historik · Tab fuldfør.',
          'At the prompt: ↑↓ history · Tab complete.',
        )}
        <br />
        {t(
          'I resultater: ↑↓ vælg · Enter åbn · Esc tilbage til prompt.',
          'In results: ↑↓ select · Enter open · Esc return to prompt.',
        )}
        <br />
        {t('Prøv også', 'Also try')} <code>/projects partypal</code> {t('eller', 'or')}{' '}
        <code>/experience 1</code>.
      </p>
    </div>
  );
}
export function Terminal({ openFolder }: { openFolder: (section: Section) => void }) {
  const { cv, sections, t, language } = useLocale();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [welcome, setWelcome] = useState(true);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const historyIndex = useRef(-1);
  const draft = useRef('');
  const completion = useRef<{ matches: string[]; index: number } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const output = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  useEffect(() => {
    if (matchMedia('(pointer: fine)').matches) input.current?.focus();
  }, []);
  useEffect(() => {
    const last = output.current?.lastElementChild;
    last?.scrollIntoView({ block: 'nearest' });
  }, [entries]);
  function focusPrompt() {
    input.current?.focus();
  }
  function run(raw: string) {
    if (!raw.trim()) return;
    const result = resolveCommand(raw, language);
    setHistory((previous) => [...previous, raw.trim()].slice(-100));
    historyIndex.current = -1;
    draft.current = '';
    completion.current = null;
    setValue('');
    setSuggestions([]);
    if (result.type === 'clear') {
      setEntries([]);
      setWelcome(false);
    } else
      setEntries((previous) =>
        [...previous, { id: nextId.current++, command: raw.trim(), result }].slice(-50),
      );
    if (
      !(
        result.type === 'section' &&
        ['projects', 'experience'].includes(result.section) &&
        !result.detail
      ) &&
      matchMedia('(pointer: fine)').matches
    )
      focusPrompt();
  }
  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      run(value);
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      completion.current = null;
      setSuggestions([]);
      if (!history.length) return;
      if (historyIndex.current === -1) draft.current = value;
      historyIndex.current =
        event.key === 'ArrowUp'
          ? Math.min(historyIndex.current + 1, history.length - 1)
          : Math.max(historyIndex.current - 1, -1);
      setValue(
        historyIndex.current === -1
          ? draft.current
          : history[history.length - 1 - historyIndex.current],
      );
    }
    if (event.key === 'Tab' && !event.shiftKey && value.startsWith('/')) {
      const matches = completion.current?.matches ?? completeCommand(value);
      if (matches.length) {
        event.preventDefault();
        const index = completion.current ? (completion.current.index + 1) % matches.length : 0;
        completion.current = { matches, index };
        setValue(matches[index]);
        setSuggestions(matches.length > 1 ? matches : []);
      }
    }
    if (event.key === 'Escape') {
      setValue('');
      setSuggestions([]);
      completion.current = null;
    }
    if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault();
      run('/clear');
    }
  }
  return (
    <div className="terminal-app">
      <div className="terminal-menu">
        <span>
          <TerminalIcon size={13} />
          Terminal
        </span>
        <span className="terminal-session">
          <span className="status-dot" />
          {cv.profile.username}@portfolio: ~
        </span>
        <button onClick={() => run('/help')}>
          <Command size={12} />
          {t('Kommandoer', 'Commands')}
        </button>
      </div>
      <div className="terminal-scroll" ref={output} aria-label="Terminal output" tabIndex={0}>
        {welcome && (
          <div className="terminal-welcome">
            <div className="terminal-intro">
              <div className="terminal-profile-photo">
                <img
                  src={`${import.meta.env.BASE_URL}images/profile.jpg`}
                  alt={t('Gabriel Back ved sin computer', 'Gabriel Back at his computer')}
                />
                <span aria-hidden="true">GB</span>
              </div>
              <div>
                <div className="terminal-system">
                  GABRIEL OS <span>v3.0</span>
                </div>
                <h1>
                  {t('Hej, jeg er', 'Hello, I’m')} {cv.profile.name.split(' ')[0]}
                  <span className="blue-text">.</span>
                </h1>
                <p>{cv.profile.role}</p>
                <div className="terminal-location">
                  {cv.profile.location} <span>·</span>{' '}
                  <span className="green-text">{cv.profile.availability}</span>
                </div>
              </div>
            </div>
            <div className="terminal-divider" />
            <p className="welcome-copy">
              {t(
                'Jeg bygger produkter, der skal virke i virkeligheden.',
                'I build products that need to work in the real world.',
              )}
              <br />
              {t(
                'Her er arbejdet, erfaringen og mennesket bag.',
                'Here’s the work, the experience, and the person behind it.',
              )}
            </p>
            <p className="start-hint">
              {t(
                'Skriv en kommando, eller klik dig på opdagelse.',
                'Type a command, or click to explore.',
              )}
            </p>
            <div className="quick-commands">
              {sections
                .filter((s) => s.id !== 'cv')
                .map((s) => (
                  <button key={s.id} onClick={() => run(`/${s.id}`)}>
                    <span>/{s.id}</span>
                    <small>{s.description}</small>
                    <ArrowRight size={13} />
                  </button>
                ))}
              <button onClick={() => run('/help')}>
                <span>/help</span>
                <small>{t('Find rundt på skrivebordet', 'Find your way around')}</small>
                <ArrowRight size={13} />
              </button>
            </div>
            <div className="terminal-welcome-footer">
              <span>
                <span className="green-text">➜</span>{' '}
                {t(
                  'Foretrækker du at klikke? Prøv mapperne på skrivebordet.',
                  'Prefer clicking? Try the desktop folders.',
                )}
              </span>
              <button onClick={() => openFolder('projects')}>
                {t('Åbn projekter', 'Open Projects')}
                <FolderOpen size={13} />
              </button>
            </div>
          </div>
        )}
        {entries.map((entry, index) => (
          <section className="terminal-entry" key={entry.id}>
            <div className="past-command">
              <span>{cv.profile.username}@portfolio</span>
              <span>:~$</span> {entry.command}
            </div>
            {entry.result.type === 'error' && (
              <p className="terminal-error" role="status">
                {commandError(entry.command, language)}
              </p>
            )}
            {entry.result.type === 'help' && <Help run={run} />}
            {entry.result.type === 'section' && (
              <>
                {!entry.result.detail &&
                (entry.result.section === 'projects' || entry.result.section === 'experience') ? (
                  <ResultList
                    section={entry.result.section}
                    run={run}
                    returnToPrompt={focusPrompt}
                    active={index === entries.length - 1}
                  />
                ) : (
                  <div className="terminal-content">
                    <SectionContent section={entry.result.section} detail={entry.result.detail} />
                    {entry.result.detail && (
                      <button
                        className="terminal-back"
                        onClick={() =>
                          run(`/${entry.result.type === 'section' ? entry.result.section : ''}`)
                        }
                      >
                        ← {t('Tilbage til resultater', 'Back to results')}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        ))}
        {!welcome && !entries.length && (
          <p className="cleared-message">
            {t('En frisk start. Skriv', 'A fresh start. Type')}{' '}
            <button onClick={() => run('/help')}>/help</button>{' '}
            {t('for at udforske.', 'to explore.')}
          </p>
        )}
      </div>
      <div className="terminal-input-area">
        {suggestions.length > 0 && (
          <div className="completion-options">
            {suggestions.map((s) => (
              <button key={s} onClick={() => run(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          className="prompt-row"
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
          }}
        >
          <span className="prompt-user">
            ┌──(<strong>{cv.profile.username}㉿portfolio</strong>)-[<span>~</span>]<br />
            └─<span className="blue-text">$</span>
          </span>
          <input
            ref={input}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              historyIndex.current = -1;
              completion.current = null;
              setSuggestions([]);
            }}
            onKeyDown={keyDown}
            aria-label="Terminal command"
            aria-describedby="terminal-shortcuts"
            placeholder={t('Prøv /help', 'Try /help')}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button type="submit" aria-label="Run command" title="Run command">
            <CornerDownLeft size={17} />
          </button>
        </form>
      </div>
      <footer className="terminal-status">
        <span id="terminal-shortcuts">
          <kbd>Tab</kbd> {t('fuldfør', 'complete')} <span>·</span> <kbd>↑ ↓</kbd>{' '}
          {t('historik', 'history')}
        </span>
        <button onClick={() => downloadCV(language)}>
          <ArrowDownToLine size={12} />
          CV .txt
        </button>
        <span className="simulation-label">
          {t('Virtuel terminal', 'Virtual terminal')} <span className="status-dot" />
        </span>
      </footer>
    </div>
  );
}
