import { ArrowDownToLine, ArrowUpRight, Check, Copy, MapPin } from 'lucide-react';
import { useState } from 'react';
import { downloadCV, initials, type Section } from '../content/cv';
import { AppIcon } from './Icons';
import { useLocale } from '../Locale';

export function Tags({ items }: { items: string[] }) {
  return (
    <div className="tags">
      {items.map((t) => (
        <span key={t}>{t}</span>
      ))}
    </div>
  );
}
function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="detail-bullets">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}
export function SectionContent({
  section,
  detail,
  onSelect,
}: {
  section: Section;
  detail?: string;
  onSelect?: (id: string) => void;
}) {
  const { cv, t, language } = useLocale();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  if (section === 'projects') {
    const project = cv.projects.find((p) => p.id === detail);
    if (project)
      return (
        <article className="detail">
          <div className={`project-banner ${project.accent}`}>
            <span>{project.symbol}</span>
            <span>
              {project.name.toLowerCase()}
              <small>{project.category}</small>
            </span>
          </div>
          {project.image && (
            <img
              className="project-detail-image"
              src={`${import.meta.env.BASE_URL}images/${project.image}`}
              alt={project.name}
              loading="lazy"
            />
          )}
          <div className="eyebrow">
            {project.category} <span> / {project.year}</span>
          </div>
          <h2>{project.name}</h2>
          <p className="lead">{project.summary}</p>
          <p>{project.description}</p>
          <h3>{t('Projektets højdepunkter', 'Project highlights')}</h3>
          <Bullets items={project.highlights} />
          {project.stack.length > 0 && (
            <>
              <h3>{t('Teknologier', 'Built with')}</h3>
              <Tags items={project.stack} />
            </>
          )}
          {project.url && (
            <a className="primary-button" href={project.url} target="_blank" rel="noreferrer">
              {t('Besøg hjemmesiden', 'Visit website')} <ArrowUpRight size={16} />
            </a>
          )}
          <p className="demo-note">{project.year} · Gabriel Back</p>
        </article>
      );
    return (
      <div className="project-grid">
        {cv.projects.map((p) => (
          <button className="project-card" key={p.id} onClick={() => onSelect?.(p.id)}>
            <div className={`project-banner ${p.accent}`}>
              <span>{p.symbol}</span>
              <span>
                {p.name.toLowerCase()}
                <small>{p.category}</small>
              </span>
              <ArrowUpRight size={17} />
            </div>
            <div className="project-card-body">
              <div className="flex items-center justify-between gap-3">
                <h3>{p.name}</h3>
                <span className="muted text-xs">{p.year}</span>
              </div>
              <p>{p.summary}</p>
              <Tags items={p.stack.slice(0, 3)} />
            </div>
          </button>
        ))}
      </div>
    );
  }
  if (section === 'experience') {
    const experience = cv.experience.find((e) => e.id === detail);
    if (experience)
      return (
        <article className="detail">
          <div className="eyebrow">{experience.period}</div>
          <h2>{experience.role}</h2>
          <p className="lead">{experience.company}</p>
          <p className="location">
            <MapPin size={14} />
            {experience.location}
          </p>
          <p>{experience.summary}</p>
          <h3>{t('Ansvar & bidrag', 'Responsibilities & contributions')}</h3>
          <Bullets items={experience.highlights} />
          <Tags items={experience.stack} />
        </article>
      );
    return (
      <div className="experience-list">
        {cv.experience.map((e) => (
          <button key={e.id} className="experience-card" onClick={() => onSelect?.(e.id)}>
            <div className="company-avatar">
              {e.company
                .split(' ')
                .filter((w) => /[\p{L}\p{N}]/u.test(w))
                .map((w) => w[0])
                .slice(0, 3)
                .join('')}
            </div>
            <div>
              <div className="eyebrow">
                {e.period}
                {e.current && <span className="current-tag">{t('Aktuel', 'Current')}</span>}
              </div>
              <h3>{e.role}</h3>
              <p>
                {e.company} <span className="muted">· {e.location}</span>
              </p>
              <p className="muted">{e.summary}</p>
            </div>
            <ArrowUpRight size={17} />
          </button>
        ))}
      </div>
    );
  }
  if (section === 'about')
    return (
      <article className="detail about-content">
        <div className="profile-heading">
          <div className="profile-avatar">
            <img src={`${import.meta.env.BASE_URL}images/profile.jpg`} alt="Gabriel Back" />
            <span className="sr-only">{initials}</span>
            <span />
          </div>
          <div>
            <div className="eyebrow">{t('Fra behov til drift', 'A little introduction')}</div>
            <h2>{cv.profile.name}</h2>
            <p className="location">
              <MapPin size={13} />
              {cv.profile.location}
            </p>
          </div>
        </div>
        <div className="profile-facts">
          {cv.profile.facts.map((f) => (
            <div key={f.value}>
              <strong>{f.value}</strong>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
        <p className="lead">{cv.profile.tagline}</p>
        {cv.profile.bio.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <h3>{t('Fokusområder', 'Beyond the keyboard')}</h3>
        <Tags items={cv.profile.interests} />
        <h3>{t('Uddannelse', 'Education')}</h3>
        {cv.education.map((e) => (
          <div className="education" key={e.degree}>
            <strong>{e.degree}</strong>
            <p>
              {e.school} · {e.period}
            </p>
            <p className="muted">{e.description}</p>
          </div>
        ))}
      </article>
    );
  if (section === 'skills')
    return (
      <div className="skills-grid">
        {cv.skills.map((s, i) => (
          <article className="skill-card" key={s.name}>
            <div className="skill-number">0{i + 1}</div>
            <h3>{s.name}</h3>
            <p>{s.description}</p>
            <Tags items={s.items} />
          </article>
        ))}
      </div>
    );
  if (section === 'contact')
    return (
      <article className="detail contact-content">
        <div className="contact-illustration">
          <AppIcon id="contact" size={34} />
          <span className="status-dot" />
        </div>
        <span className="availability">
          <span className="status-dot" />
          {cv.profile.availability}
        </span>
        <h2>
          {t('Et godt produkt', 'A good product')}
          <br />
          {t('starter med en samtale.', 'starts with a conversation.')}
        </h2>
        <p>{cv.contact.note}</p>
        <div className="email-row">
          <a href={`mailto:${cv.contact.email}`}>
            {cv.contact.email}
            <ArrowUpRight size={17} />
          </a>
          <button
            title={t('Kopiér e-mail', 'Copy email')}
            aria-label={t('Kopiér e-mail', 'Copy email')}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(cv.contact.email);
                setCopied(true);
                setCopyError(false);
                setTimeout(() => setCopied(false), 2500);
              } catch {
                setCopyError(true);
              }
            }}
          >
            {copied ? <Check size={17} /> : <Copy size={17} />}
          </button>
        </div>
        <span className="copy-status" role="status">
          {copied
            ? t('E-mail kopieret.', 'Email copied.')
            : copyError
              ? t(
                  'Markér e-mailadressen for at kopiere den manuelt.',
                  'Select the email address to copy it manually.',
                )
              : ''}
        </span>
        <div className="contact-links">
          {cv.contact.links.map((l) => (
            <a key={l.label} href={l.url} target="_blank" rel="noreferrer">
              <div>
                <strong>{l.label}</strong>
                <span>{l.display}</span>
              </div>
              <ArrowUpRight size={18} />
            </a>
          ))}
        </div>
        <p className="demo-note">
          <a href={`tel:${cv.contact.phone.replaceAll(' ', '')}`}>{cv.contact.phone}</a> ·{' '}
          {cv.profile.location}
        </p>
      </article>
    );
  return (
    <article className="detail full-cv">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <div className="eyebrow">Curriculum vitae</div>
          <h2>{cv.profile.name}</h2>
          <p>{cv.profile.role}</p>
          <p>
            {cv.profile.location} · {cv.profile.availability}
          </p>
        </div>
        <button className="primary-button" onClick={() => downloadCV(language)}>
          <ArrowDownToLine size={16} />
          {t('Hent .txt', 'Download .txt')}
        </button>
      </div>
      <h3>{t('Om mig', 'About')}</h3>
      {cv.profile.bio.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <h3>{t('Erfaring', 'Experience')}</h3>
      {cv.experience.map((e) => (
        <section className="resume-item" key={e.id}>
          <h4>
            {e.role} · {e.company}
          </h4>
          <p className="muted">
            {e.period} · {e.location}
          </p>
          <p>{e.summary}</p>
          <Bullets items={e.highlights} />
          <Tags items={e.stack} />
        </section>
      ))}
      <h3>{t('Projekter', 'Projects')}</h3>
      {cv.projects.map((p) => (
        <section className="resume-item" key={p.id}>
          <h4>
            {p.name} · {p.year} · {p.category}
          </h4>
          <p>{p.summary}</p>
          <p>{p.description}</p>
          <Bullets items={p.highlights} />
          <Tags items={p.stack} />
        </section>
      ))}
      <h3>{t('Kompetencer', 'Skills')}</h3>
      {cv.skills.map((s) => (
        <section key={s.name}>
          <h4>{s.name}</h4>
          <p>{s.description}</p>
          <Tags items={s.items} />
        </section>
      ))}
      <h3>{t('Uddannelse', 'Education')}</h3>
      {cv.education.map((e) => (
        <section key={e.degree}>
          <h4>{e.degree}</h4>
          <p>
            {e.school} · {e.period}
          </p>
          <p>{e.description}</p>
        </section>
      ))}
      <h3>{t('Fokusområder', 'Interests')}</h3>
      <Tags items={cv.profile.interests} />
      <h3>{t('Kontakt', 'Contact')}</h3>
      <p>{cv.contact.note}</p>
      <a href={`mailto:${cv.contact.email}`}>{cv.contact.email}</a>
      {cv.contact.links.map((l) => (
        <p key={l.label}>
          <a href={l.url} target="_blank" rel="noreferrer">
            {l.label} - {l.display}
          </a>
        </p>
      ))}
      <p className="demo-note">Gabriel Back · {cv.contact.phone}</p>
    </article>
  );
}
