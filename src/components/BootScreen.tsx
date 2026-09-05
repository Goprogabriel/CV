import { useEffect, useState } from 'react';
import { ArrowRight, Power } from 'lucide-react';
import { useLocale } from '../Locale';
export type PowerState = 'booting' | 'ready' | 'shutdown' | 'off';
export function BootScreen({
  state,
  onReady,
  onPower,
}: {
  state: Exclude<PowerState, 'ready'>;
  onReady: () => void;
  onPower: () => void;
}) {
  const { t, language, setLanguage } = useLocale();
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    if (state === 'off') return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const total = state === 'shutdown' ? 950 : 2800;
    const interval = setInterval(() => setStep((s) => Math.min(5, s + 1)), total / 6);
    const timer = setTimeout(onReady, reduced ? 250 : total);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [state, onReady]);
  const lines =
    state === 'shutdown'
      ? [
          t('Afslutter session…', 'Closing the session…'),
          t('Gemmer skrivebord…', 'Saving the desktop…'),
          t('Lukker vinduer…', 'Closing windows…'),
          t('På gensyn.', 'See you soon.'),
        ]
      : [
          t('Indlæser systemet…', 'Loading the system…'),
          t('Monterer CV-arkiv…', 'Mounting the CV archive…'),
          t('Gendanner personligt skrivebord…', 'Restoring the personal desktop…'),
          t('Starter vindueshåndtering…', 'Starting the window manager…'),
          t('Åbner terminal…', 'Opening the terminal…'),
          t('Klar. Velkommen indenfor.', 'Ready. Make yourself at home.'),
        ];
  return (
    <main className={`boot-screen power-${state}`}>
      <div className="boot-top">
        <span>GABRIEL OS / PERSONAL EDITION</span>
        <button onClick={() => setLanguage(language === 'da' ? 'en' : 'da')}>
          {language === 'da' ? 'EN' : 'DA'}
        </button>
      </div>
      {state === 'off' ? (
        <div className="power-off-content">
          <button
            className="power-on-button"
            aria-label={t('Tænd computer', 'Power on computer')}
            onClick={onPower}
          >
            <Power size={30} />
          </button>
          <h1>{t('Skrivebordet er slukket.', 'The desktop is powered off.')}</h1>
          <p>
            {t(
              'Dine lokale filer og indstillinger venter på dig.',
              'Your local files and settings will be here when you return.',
            )}
          </p>
          <button className="power-start-text" onClick={onPower}>
            {t('Tænd igen', 'Power on')}
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="boot-center">
          <div className="boot-profile-photo">
            <img
              src={`${import.meta.env.BASE_URL}images/profile.jpg`}
              alt={t('Gabriel Back ved sin computer', 'Gabriel Back at his computer')}
            />
            <span>GB</span>
          </div>
          <h1>
            gabriel<span>os</span>
            <sup>3.0</sup>
          </h1>
          <p className="boot-tagline">
            {t('Et skrivebord. Et CV. Hele historien.', 'One desktop. One CV. The whole story.')}
          </p>
          <div className="boot-progress">
            <div style={{ width: `${((step + 1) / 6) * 100}%` }} />
          </div>
          <div className="boot-log" role="status" aria-live="polite">
            {lines.slice(0, step + 1).map((line, i) => (
              <div key={line}>
                <span>{i < step ? '[ OK ]' : '[ .. ]'}</span>
                {line}
              </div>
            ))}
          </div>
          {state === 'booting' && (
            <button className="skip-boot" onClick={onReady}>
              {t('Spring opstart over', 'Skip startup')}
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}
      <footer className="boot-footer">
        <span>GABRIEL BACK</span>
        <span>
          {t('Virtuelt skrivebord · gemt i din browser', 'Virtual desktop · saved in your browser')}
        </span>
      </footer>
    </main>
  );
}
