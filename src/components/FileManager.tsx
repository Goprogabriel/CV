import { ArrowLeft, ChevronRight, Grid2X2, Home, Search, X } from 'lucide-react';
import { useState } from 'react';
import { type Section } from '../content/cv';
import { AppIcon } from './Icons';
import { useLocale } from '../Locale';
import { SectionContent } from './Content';
export function FileManager({
  section,
  onNavigate,
}: {
  section: Section;
  onNavigate: (section: Section) => void;
}) {
  const { cv, sections, t } = useLocale();
  const [detail, setDetail] = useState<string>();
  const [query, setQuery] = useState('');
  const meta = sections.find((s) => s.id === section)!;
  const itemName =
    section === 'projects'
      ? cv.projects.find((p) => p.id === detail)?.name
      : cv.experience.find((e) => e.id === detail)?.company;
  const items =
    section === 'projects'
      ? cv.projects.map((p) => ({ id: p.id, name: p.name, description: p.summary }))
      : section === 'experience'
        ? cv.experience.map((e) => ({ id: e.id, name: e.company, description: e.role }))
        : [];
  const filtered = items.filter((i) =>
    `${i.name} ${i.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  function navigate(next: Section) {
    onNavigate(next);
    setDetail(undefined);
    setQuery('');
  }
  return (
    <div className="file-manager">
      <div className="file-toolbar">
        <button
          aria-label={t('Tilbage til mappe', 'Back to folder')}
          title={t('Tilbage til mappe', 'Back to folder')}
          disabled={!detail}
          onClick={() => setDetail(undefined)}
        >
          <ArrowLeft size={17} />
        </button>
        <div className="breadcrumb">
          <Home size={14} />
          <span>{cv.profile.username}</span>
          <ChevronRight size={13} />
          <button onClick={() => setDetail(undefined)}>{meta.label}</button>
          {detail && (
            <>
              <ChevronRight size={13} />
              <span className="truncate">{itemName}</span>
            </>
          )}
        </div>
        <Grid2X2 size={15} className="muted" />
      </div>
      <div className="file-layout">
        <nav className="file-sidebar" aria-label={t('Steder', 'Places')}>
          <div className="sidebar-label">{t('STEDER', 'PLACES')}</div>
          {sections.map((s) => (
            <button
              key={s.id}
              className={s.id === section ? 'selected' : ''}
              onClick={() => navigate(s.id)}
            >
              <AppIcon id={s.id} size={16} />
              <span>{s.label}</span>
              {s.id === 'projects' && <small>{cv.projects.length}</small>}
            </button>
          ))}
          <div className="sidebar-bottom">
            <span className="status-dot" />
            {t('Personligt skrivebord', 'Personal workspace')}
          </div>
        </nav>
        <div className="file-main">
          <header className="content-heading">
            <div>
              <div className="eyebrow">
                /home/{cv.profile.username}/{section}
              </div>
              <h1>{detail ? itemName : meta.label}</h1>
              <p>
                {detail
                  ? t('Et nærmere kig på arbejdet.', 'A closer look at the work.')
                  : meta.description}
              </p>
            </div>
            {!detail && items.length > 0 && (
              <label className="file-search">
                <Search size={14} />
                <input
                  aria-label={`${t('Søg i', 'Search')} ${meta.label.toLowerCase()}`}
                  placeholder={t('Søg…', 'Search…')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    aria-label={t('Ryd søgning', 'Clear search')}
                    onClick={() => setQuery('')}
                  >
                    <X size={12} />
                  </button>
                )}
              </label>
            )}
          </header>
          <div className="file-content" key={`${section}-${detail ?? ''}`}>
            {query && !detail ? (
              <div className="search-results">
                {filtered.length ? (
                  filtered.map((i) => (
                    <button
                      key={i.id}
                      onClick={() => {
                        setDetail(i.id);
                        setQuery('');
                      }}
                    >
                      <AppIcon id={section} size={22} />
                      <div>
                        <strong>{i.name}</strong>
                        <p>{i.description}</p>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                  ))
                ) : (
                  <p className="empty-state">
                    {t('Ingen resultater for', 'No matches for')} “{query}”.{' '}
                    {t('Prøv en anden søgning.', 'Try another search.')}
                  </p>
                )}
              </div>
            ) : (
              <SectionContent section={section} detail={detail} onSelect={setDetail} />
            )}
          </div>
        </div>
      </div>
      <footer className="file-status">
        <span>
          {detail
            ? t('1 element valgt', '1 item selected')
            : items.length
              ? `${query ? filtered.length : items.length} ${t('elementer', 'items')}`
              : meta.label}
        </span>
        <span>
          Gabriel Back <span className="status-separator">·</span> {t('CV-arkiv', 'CV archive')}
        </span>
      </footer>
    </div>
  );
}
