import { useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Globe2, Home, Search, X } from 'lucide-react';
import { useLocale } from '../Locale';
import { webDestination } from '../desktop';
export function BrowserApp() {
  const { t, cv } = useLocale();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<NonNullable<ReturnType<typeof webDestination>>[]>([]);
  const [index, setIndex] = useState(-1);
  const [error, setError] = useState(false);
  const page = history[index];
  function go(raw: string) {
    const destination = webDestination(raw);
    if (!destination) {
      setError(true);
      return;
    }
    setError(false);
    setHistory((h) => [...h.slice(0, index + 1), destination].slice(-40));
    setIndex(Math.min(index + 1, 39));
    setInput(destination.query);
    window.open(destination.url, '_blank', 'noopener,noreferrer');
  }
  function back(next: number) {
    setIndex(next);
    setInput(history[next]?.query ?? '');
    setError(false);
  }
  return (
    <div className="browser-app">
      <div className="browser-tab">
        <Globe2 size={14} />
        <span>
          {page
            ? page.kind === 'search'
              ? `${page.query} — Google`
              : new URL(page.url).hostname
            : t('Ny fane', 'New tab')}
        </span>
        <button aria-label={t('Luk fane', 'Close tab')} onClick={() => back(-1)}>
          <X size={13} />
        </button>
      </div>
      <div className="browser-toolbar">
        <button
          aria-label={t('Tilbage', 'Back')}
          disabled={index < 0}
          onClick={() => back(index - 1)}
        >
          <ArrowLeft size={16} />
        </button>
        <button
          aria-label={t('Frem', 'Forward')}
          disabled={index >= history.length - 1}
          onClick={() => back(index + 1)}
        >
          <ArrowRight size={16} />
        </button>
        <button aria-label={t('Startside', 'Home')} onClick={() => back(-1)}>
          <Home size={15} />
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            go(input);
          }}
        >
          <Globe2 size={14} />
          <input
            aria-label={t('Søg eller indtast adresse', 'Search or enter address')}
            placeholder={t(
              'Søg på Google, eller indtast en adresse',
              'Search Google or enter an address',
            )}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" aria-label={t('Åbn adresse', 'Open address')}>
            <ArrowRight size={15} />
          </button>
        </form>
      </div>
      <div className="browser-page">
        {!page ? (
          <>
            <div className="browser-home-brand">
              <Globe2 size={40} />
              <span>
                web<span className="blue-text">.</span>
              </span>
            </div>
            <h1>{t('Verden er kun en søgning væk.', 'The world is one search away.')}</h1>
            <p>
              {t(
                'Et nyt spor. Et godt spørgsmål. Et sted at begynde.',
                'A new lead. A good question. A place to start.',
              )}
            </p>
            <form
              className="browser-search"
              onSubmit={(e) => {
                e.preventDefault();
                go(input);
              }}
            >
              <Search size={19} />
              <input
                aria-label={t('Google-søgning', 'Google search')}
                placeholder={t('Hvad er du nysgerrig på?', 'What are you curious about?')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" aria-label={t('Søg på Google', 'Search Google')}>
                <ArrowRight size={19} />
              </button>
            </form>
            <div className="browser-bookmarks">
              {[
                { label: 'Google', url: 'https://www.google.com' },
                ...cv.contact.links.map((l) => ({ label: l.label, url: l.url })),
                { label: 'Wikipedia', url: 'https://www.wikipedia.org' },
              ].map((l) => (
                <button key={l.label} onClick={() => go(l.url)}>
                  <span>{l.label[0]}</span>
                  {l.label}
                  <ExternalLink size={10} />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="browser-destination">
            <div className="browser-destination-icon">
              {page.kind === 'search' ? <Search size={31} /> : <Globe2 size={31} />}
            </div>
            <div className="eyebrow">
              {page.kind === 'search'
                ? t('GOOGLE-SØGNING', 'GOOGLE SEARCH')
                : t('WEBSITE', 'WEBSITE')}
            </div>
            <h1>{page.query}</h1>
            <p>
              {t(
                'Åbnes i en almindelig browserfane, hvor du kan bruge hele websitet.',
                'Opens in a regular browser tab, where you can use the complete website.',
              )}
            </p>
            <a className="primary-button" href={page.url} target="_blank" rel="noreferrer">
              {t('Åbn i ny fane', 'Open in new tab')}
              <ExternalLink size={15} />
            </a>
            <small>
              {t(
                'Hvis fanen ikke åbnede automatisk, kan du bruge knappen ovenfor.',
                'If a tab did not open automatically, use the button above.',
              )}
            </small>
            <button className="terminal-back" onClick={() => back(-1)}>
              ← {t('Tilbage til start', 'Back to start')}
            </button>
          </div>
        )}
        {error && (
          <p className="browser-error" role="alert">
            {t(
              'Indtast en søgning eller en gyldig http-/https-adresse.',
              'Enter a search or a valid http/https address.',
            )}
          </p>
        )}
        <div className="browser-explanation">
          <ExternalLink size={13} />
          <span>
            {t(
              'Google og mange websites tillader ikke indlejring. Søgninger og links åbner derfor i en ny fane.',
              'Google and many websites do not allow embedding. Searches and links open in a new tab.',
            )}
          </span>
        </div>
      </div>
      <footer className="file-status">
        <span>{t('Browser', 'Browser')}</span>
        <span>{t('Eksterne sider åbner i en ny fane', 'External pages open in a new tab')}</span>
      </footer>
    </div>
  );
}
