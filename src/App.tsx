import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FilePlus2,
  FileText,
  Folder,
  FolderPlus,
  Globe2,
  Grid2X2,
  HardDrive,
  Monitor,
  Pencil,
  Power,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Trash2,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { downloadCV, type AppId, type Section } from './content/cv';
import { useLocale } from './Locale';
import { AppIcon, DesktopMark, FolderIcon } from './components/Icons';
import { Terminal } from './components/Terminal';
import { FileManager } from './components/FileManager';
import { Window, type WindowState } from './components/Window';
import { constrainBounds } from './windows';
import { BootScreen, type PowerState } from './components/BootScreen';
import { DesktopIcon } from './components/DesktopIcon';
import { BrowserApp } from './components/BrowserApp';
import { FileDialog, type FileAction } from './components/FileDialog';
import { LocalFiles, TextEditor } from './components/LocalFiles';
import {
  canMove,
  descendants,
  parseDesktop,
  storageKey,
  type DesktopData,
  type DesktopFile,
  type Point,
} from './desktop';

const startWindows = (): WindowState[] => [
  {
    id: 'terminal',
    app: 'terminal',
    minimized: false,
    maximized: false,
    z: 1,
    bounds: constrainBounds(
      {
        x: Math.max(180, (innerWidth - 810) / 2),
        y: Math.max(80, (innerHeight - 620) / 2),
        width: 810,
        height: 620,
      },
      { width: innerWidth, height: innerHeight },
    ),
  },
];
type ContextMenu = { x: number; y: number; id?: string; parentId: string | null };
export default function App() {
  const { language, setLanguage, cv, sections, t } = useLocale();
  const [power, setPower] = useState<PowerState>('booting');
  const [afterShutdown, setAfterShutdown] = useState<'off' | 'booting'>('off');
  const [windows, setWindows] = useState<WindowState[]>(startWindows);
  const nextZ = useRef(1);
  const [desktop, setDesktop] = useState<DesktopData>(() => {
    try {
      return parseDesktop(localStorage.getItem(storageKey));
    } catch {
      return parseDesktop(null);
    }
  });
  const [storageOk, setStorageOk] = useState(true);
  const [toast, setToast] = useState('');
  const [viewport, setViewport] = useState({ width: innerWidth, height: innerHeight });
  const [time, setTime] = useState(new Date());
  const [online, setOnline] = useState(navigator.onLine);
  const [popover, setPopover] = useState<
    'apps' | 'power' | 'network' | 'sound' | 'calendar' | 'guide' | null
  >(null);
  const [volume, setVolume] = useState(35);
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [context, setContext] = useState<ContextMenu | null>(null);
  const [fileAction, setFileAction] = useState<FileAction | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showDesktop, setShowDesktop] = useState(false);
  const restored = useRef<string[]>([]);
  const contextRef = useRef<HTMLDivElement>(null);
  const active = windows
    .filter((w) => !w.minimized)
    .reduce<WindowState | undefined>((a, b) => (!a || b.z > a.z ? b : a), undefined)?.id;
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(desktop));
      setStorageOk(true);
    } catch {
      setStorageOk(false);
    }
  }, [desktop]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const resize = () => {
      setViewport({ width: innerWidth, height: innerHeight });
      setContext(null);
      setWindows((ws) =>
        ws.map((w) => ({
          ...w,
          bounds: constrainBounds(w.bounds, { width: innerWidth, height: innerHeight }),
        })),
      );
    };
    const status = () => setOnline(navigator.onLine);
    window.addEventListener('resize', resize);
    window.addEventListener('online', status);
    window.addEventListener('offline', status);
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('online', status);
      window.removeEventListener('offline', status);
    };
  }, []);
  useEffect(() => {
    const dismiss = (e: globalThis.PointerEvent) => {
      if (!(e.target as HTMLElement).closest('.context-menu')) setContext(null);
      if (
        !(e.target as HTMLElement).closest(
          '.system-popover,.applications-menu,.top-panel,.desktop-guide',
        )
      )
        setPopover(null);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);
  useEffect(() => {
    contextRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
  }, [context]);
  const bootComplete = useCallback(() => {
    if (power === 'shutdown') {
      setWindows(startWindows());
      nextZ.current = 1;
      setPower(afterShutdown);
    } else setPower('ready');
  }, [power, afterShutdown]);
  function turnOn() {
    setWindows(startWindows());
    nextZ.current = 1;
    setPower('booting');
  }
  function shutDown(restart = false) {
    setPopover(null);
    setContext(null);
    setFileAction(null);
    setAfterShutdown(restart ? 'booting' : 'off');
    setPower('shutdown');
    setShowDesktop(false);
  }
  function label(app: AppId) {
    return (
      sections.find((s) => s.id === app)?.label ??
      (
        {
          terminal: 'Terminal',
          browser: t('Browser', 'Browser'),
          files: t('Mine filer', 'My files'),
          editor: t('Teksteditor', 'Text editor'),
          settings: t('Indstillinger', 'Settings'),
        } as Record<string, string>
      )[app]
    );
  }
  function title(w: WindowState) {
    const file = desktop.files.find((f) => f.id === w.nodeId);
    if (w.app === 'terminal') return 'gabriel@portfolio: ~';
    if (w.app === 'editor') return file?.name ?? label('editor');
    if (w.app === 'files')
      return `${file?.name ?? label('files')} — ${t('Filhåndtering', 'File Manager')}`;
    if (sections.some((s) => s.id === w.app))
      return `${label(w.section ?? w.app)} — ${t('Filhåndtering', 'File Manager')}`;
    return label(w.app);
  }
  function patch(id: string, change: Partial<WindowState>) {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, ...change } : w)));
  }
  function focus(id: string) {
    if (active !== id) patch(id, { z: ++nextZ.current });
  }
  function open(app: AppId, nodeId?: string) {
    const id = nodeId ? `${app}:${nodeId}` : app;
    const z = ++nextZ.current;
    setPopover(null);
    setContext(null);
    setShowDesktop(false);
    setWindows((ws) =>
      ws.some((w) => w.id === id)
        ? ws.map((w) =>
            w.id === id
              ? {
                  ...w,
                  nodeId,
                  minimized: false,
                  z,
                  section: sections.some((s) => s.id === app) ? (app as Section) : undefined,
                }
              : w,
          )
        : [
            ...ws,
            {
              id,
              app,
              nodeId,
              z,
              minimized: false,
              maximized: false,
              bounds: constrainBounds(
                {
                  x: Math.max(165, (innerWidth - 860) / 2) + (ws.length % 5) * 22,
                  y: 80 + (ws.length % 5) * 25,
                  width: app === 'editor' ? 700 : app === 'settings' ? 690 : 860,
                  height: app === 'editor' ? 530 : 620,
                },
                { width: innerWidth, height: innerHeight },
              ),
            },
          ],
    );
  }
  function openFile(file: DesktopFile) {
    open(file.kind === 'folder' ? 'files' : 'editor', file.id);
  }
  function close(id: string) {
    setWindows((ws) => ws.filter((w) => w.id !== id));
  }
  function toggleDesktop() {
    if (showDesktop) {
      setWindows((ws) =>
        ws.map((w) => (restored.current.includes(w.id) ? { ...w, minimized: false } : w)),
      );
      setShowDesktop(false);
    } else {
      restored.current = windows.filter((w) => !w.minimized).map((w) => w.id);
      setWindows((ws) => ws.map((w) => ({ ...w, minimized: true })));
      setShowDesktop(true);
    }
  }
  function newFile(kind: 'folder' | 'text', parentId: string | null = null) {
    setContext(null);
    setPopover(null);
    if (desktop.files.length >= 150) {
      setToast(
        t(
          'Der er plads til 150 lokale filer. Slet en fil for at oprette flere.',
          'You can save 150 local files. Delete a file to create more.',
        ),
      );
      return;
    }
    setFileAction({ kind, parentId, x: context?.x, y: context?.y });
  }
  function fileMenu(x: number, y: number, id?: string, parentId: string | null = null) {
    setPopover(null);
    setContext({
      x: Math.max(8, Math.min(x, innerWidth - 230)),
      y: Math.max(43, Math.min(y, innerHeight - 335)),
      id,
      parentId,
    });
  }
  function submitFile(name: string) {
    if (!fileAction) return;
    const action = fileAction;
    if (action.kind === 'delete' && action.id) {
      const ids = descendants(desktop.files, action.id);
      setDesktop((d) => ({
        ...d,
        files: d.files.filter((f) => !ids.includes(f.id)),
        positions: Object.fromEntries(
          Object.entries(d.positions).filter(([key]) => !ids.includes(key)),
        ),
      }));
      setWindows((ws) => ws.filter((w) => !ids.includes(w.nodeId ?? '')));
    } else if (action.kind === 'rename') {
      setDesktop((d) => ({
        ...d,
        files: d.files.map((f) =>
          f.id === action.id ? { ...f, name, modified: new Date().toISOString() } : f,
        ),
      }));
    } else if (action.kind === 'folder' || action.kind === 'text') {
      const id = crypto.randomUUID();
      const file: DesktopFile = {
        id,
        name,
        kind: action.kind,
        parentId: action.parentId,
        content: '',
        modified: new Date().toISOString(),
      };
      setDesktop((d) => ({
        ...d,
        files: [...d.files, file],
        positions:
          action.parentId === null && action.x !== undefined
            ? { ...d.positions, [id]: { x: action.x, y: action.y ?? 80 } }
            : d.positions,
      }));
      setSelected(id);
      if (action.kind === 'text') open('editor', id);
    }
    setFileAction(null);
  }
  function moveFile(id: string, parentId: string | null) {
    if (!canMove(desktop.files, id, parentId)) {
      setToast(
        t(
          'Elementet kan ikke flyttes hertil. Tjek navn og mappe.',
          'This item cannot be moved here. Check the name and folder.',
        ),
      );
      return;
    }
    setDesktop((d) => ({
      ...d,
      files: d.files.map((f) => (f.id === id ? { ...f, parentId } : f)),
    }));
    setContext(null);
  }
  function moveIcon(id: string, point: Point) {
    setDesktop((d) => ({ ...d, positions: { ...d.positions, [id]: point } }));
  }
  function arrange() {
    setDesktop((d) => ({ ...d, positions: {} }));
    setContext(null);
    setToast(t('Ikonerne er arrangeret.', 'Icons arranged.'));
  }
  function togglePopover(next: typeof popover) {
    setContext(null);
    setPopover((v) => (v === next ? null : next));
  }
  function testSound() {
    try {
      const audio = new AudioContext();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 660;
      gain.gain.setValueAtTime((volume / 100) * 0.08, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.24);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.25);
      oscillator.onended = () => {
        void audio.close();
      };
    } catch {
      setToast(
        t('Lyd er ikke tilgængelig i denne browser.', 'Audio is not available in this browser.'),
      );
    }
  }
  const apps: AppId[] = [
    'terminal',
    'projects',
    'experience',
    'about',
    'skills',
    'contact',
    'cv',
    'browser',
    'files',
    'settings',
  ];
  const icons = [
    ...apps.map((app) => ({
      id: app,
      name: app === 'cv' ? 'Gabriel Back.txt' : label(app),
      app,
      file: undefined as DesktopFile | undefined,
    })),
    ...desktop.files
      .filter((f) => f.parentId === null)
      .map((file) => ({
        id: file.id,
        name: file.name,
        app: (file.kind === 'folder' ? 'files' : 'editor') as AppId,
        file,
      })),
  ];
  const contextFile = desktop.files.find((f) => f.id === context?.id);
  const contextApp = apps.find((app) => app === context?.id);
  const calendarDate = new Date(time.getFullYear(), time.getMonth() + calendarOffset, 1);
  const startDay = (calendarDate.getDay() + 6) % 7;
  const monthDays = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  if (power !== 'ready')
    return <BootScreen state={power} onReady={bootComplete} onPower={turnOn} />;
  return (
    <main
      className={`desktop wallpaper-${desktop.wallpaper}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setContext(null);
          setPopover(null);
        }
      }}
      onContextMenu={(e) => {
        if (
          (e.target as HTMLElement).closest(
            '.desktop-window,.top-panel,.taskbar,.modal-scrim,.system-popover,.desktop-guide,.context-menu',
          )
        )
          return;
        e.preventDefault();
        fileMenu(e.clientX, e.clientY);
      }}
    >
      <div className="wallpaper" aria-hidden="true">
        <div className="wallpaper-orbit orbit-one" />
        <div className="wallpaper-orbit orbit-two" />
        <div className="wallpaper-orbit orbit-three" />
        <DesktopMark className="wallpaper-mark" />
        <div className="wallpaper-grid" />
      </div>
      <header className="top-panel">
        <div className="panel-left">
          <button
            className={`applications-button ${popover === 'apps' ? 'selected' : ''}`}
            aria-expanded={popover === 'apps'}
            onClick={() => togglePopover('apps')}
          >
            <DesktopMark />
            {t('Programmer', 'Applications')}
            <ChevronDown size={12} />
          </button>
          <span className="panel-divider" />
          <button
            className="panel-icon"
            aria-label={t('Åbn terminal', 'Open terminal')}
            title="Terminal"
            onClick={() => open('terminal')}
          >
            <AppIcon id="terminal" size={17} />
          </button>
          <button
            className="panel-icon"
            aria-label={t('Åbn browser', 'Open browser')}
            title={label('browser')}
            onClick={() => open('browser')}
          >
            <Globe2 size={16} />
          </button>
          <span className="panel-divider desktop-only" />
          <button
            className="workspace-indicator desktop-only"
            title={t('Vis skrivebord', 'Show desktop')}
            onClick={toggleDesktop}
          >
            01
          </button>
          <span className="workspace-label desktop-only">
            gabriel / {t('personligt skrivebord', 'personal workspace')}
          </span>
        </div>
        <div className="panel-right">
          <button className="panel-availability" onClick={() => open('contact')}>
            <span className="status-dot" />
            {cv.profile.availability}
          </button>
          <span className="panel-divider" />
          <button
            className="language-switch"
            aria-label={t('Skift sprog til engelsk', 'Switch language to Danish')}
            title={t('Skift til English', 'Skift til dansk')}
            onClick={() => setLanguage(language === 'da' ? 'en' : 'da')}
          >
            {language.toUpperCase()}
            <ChevronDown size={10} />
          </button>
          <button
            className="panel-icon system-network"
            aria-label={t('Netværksstatus', 'Network status')}
            aria-expanded={popover === 'network'}
            onClick={() => togglePopover('network')}
          >
            {online ? <Wifi size={15} /> : <WifiOff size={15} />}
          </button>
          <button
            className="panel-icon system-sound"
            aria-label={t('Lydindstillinger', 'Sound settings')}
            aria-expanded={popover === 'sound'}
            onClick={() => togglePopover('sound')}
          >
            {volume ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button
            className="clock-button"
            aria-label={t('Åbn kalender', 'Open calendar')}
            aria-expanded={popover === 'calendar'}
            onClick={() => togglePopover('calendar')}
          >
            <time dateTime={time.toISOString()}>
              {time.toLocaleDateString(language === 'da' ? 'da-DK' : 'en-GB', {
                day: '2-digit',
                month: 'short',
              })}
              <span className="clock-separator">·</span>
              {time.toLocaleTimeString(language === 'da' ? 'da-DK' : 'en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </button>
          <button
            className="panel-icon"
            aria-label={t('Sluk eller genstart', 'Shut down or restart')}
            aria-expanded={popover === 'power'}
            title={t('Sluk eller genstart', 'Shut down or restart')}
            onClick={() => togglePopover('power')}
          >
            <Power size={15} />
          </button>
        </div>
      </header>
      {popover === 'apps' && (
        <div className="applications-menu">
          <div className="menu-profile">
            <div className="mini-avatar">GB</div>
            <div>
              <strong>Gabriel Back</strong>
              <span>{t('Mit digitale skrivebord', 'My digital desktop')}</span>
            </div>
          </div>
          <div className="sidebar-label">{t('PROGRAMMER', 'APPLICATIONS')}</div>
          {apps.map((app) => (
            <button key={app} onClick={() => open(app)}>
              <AppIcon id={app} size={18} />
              <span>
                {label(app)}
                <small>
                  {sections.find((s) => s.id === app)?.description ??
                    (app === 'terminal'
                      ? t('CV’et fra kommandolinjen', 'Explore the CV with commands')
                      : app === 'browser'
                        ? t('Søg på nettet', 'Search the web')
                        : app === 'files'
                          ? t('Dine mapper og noter', 'Your folders and notes')
                          : t('Gør skrivebordet til dit', 'Make the desktop yours'))}
                </small>
              </span>
            </button>
          ))}
          <button
            onClick={() => {
              setPopover('guide');
            }}
          >
            <CircleHelp size={18} />
            <span>{t('Guide til skrivebordet', 'Desktop guide')}</span>
          </button>
          <div className="menu-footer">
            <ShieldCheck size={13} />
            {t('Personligt CV · virtuelt skrivebord', 'Personal CV · virtual desktop')}
          </div>
        </div>
      )}
      <nav className="desktop-icon-layer" aria-label={t('Skrivebordsikoner', 'Desktop icons')}>
        {icons.map((icon, index) => {
          const rows = Math.max(1, Math.floor((viewport.height - 125) / 89));
          const columns = Math.max(1, Math.floor((viewport.width - 24) / 100));
          const natural =
            viewport.width <= 640
              ? { x: 14 + (index % columns) * 100, y: 58 + Math.floor(index / columns) * 99 }
              : { x: 22 + Math.floor(index / rows) * 104, y: 58 + (index % rows) * 89 };
          const raw = desktop.positions[icon.id] ?? natural;
          const position = {
            x: Math.max(0, Math.min(viewport.width - 95, raw.x)),
            y: Math.max(43, Math.min(viewport.height - 132, raw.y)),
          };
          return (
            <DesktopIcon
              key={icon.id}
              id={icon.id}
              label={icon.name}
              selected={selected === icon.id}
              position={position}
              onSelect={() => setSelected(icon.id)}
              onMove={(point) => moveIcon(icon.id, point)}
              onOpen={() => (icon.file ? openFile(icon.file) : open(icon.app))}
              onContext={(x, y) => fileMenu(x, y, icon.id)}
            >
              {icon.file ? (
                icon.file.kind === 'folder' ? (
                  <span className="personal-folder-icon">
                    <Folder size={49} />
                  </span>
                ) : (
                  <span className="document-icon">
                    <FileText size={31} />
                    <span>TXT</span>
                  </span>
                )
              ) : icon.app === 'terminal' ? (
                <span className="terminal-desktop-icon">
                  <span>$_</span>
                </span>
              ) : icon.app === 'browser' ? (
                <span className="browser-desktop-icon">
                  <Globe2 size={37} />
                </span>
              ) : icon.app === 'settings' ? (
                <span className="settings-desktop-icon">
                  <Settings2 size={32} />
                </span>
              ) : icon.app === 'cv' ? (
                <span className="document-icon">
                  <FileText size={31} />
                  <span>CV</span>
                </span>
              ) : (
                <FolderIcon id={icon.app} />
              )}
            </DesktopIcon>
          );
        })}
      </nav>
      <div className="desktop-signature" aria-hidden="true">
        <div>GABRIEL BACK / PERSONAL WORKSPACE</div>
        <p>
          {t('Nysgerrighed i koden.', 'Curiosity in the code.')}
          <br />
          {t('Ansvar i virkeligheden.', 'Ownership in the real world.')}
        </p>
        <span>
          gabriel@portfolio <span className="blue-text">~</span>
        </span>
      </div>
      {windows.map((w) => {
        const file = desktop.files.find((f) => f.id === w.nodeId);
        return (
          <Window
            key={w.id}
            state={w}
            title={title(w)}
            active={active === w.id}
            onFocus={() => focus(w.id)}
            onChange={(change) => patch(w.id, change)}
            onClose={() => close(w.id)}
          >
            {w.app === 'terminal' ? (
              <Terminal openFolder={open} />
            ) : w.app === 'browser' ? (
              <BrowserApp />
            ) : w.app === 'files' ? (
              <LocalFiles
                files={desktop.files}
                folderId={w.nodeId}
                onNavigate={(parentId) => patch(w.id, { nodeId: parentId ?? undefined })}
                onOpen={openFile}
                onNew={newFile}
                onContext={fileMenu}
                onMove={moveFile}
              />
            ) : w.app === 'editor' && file ? (
              <TextEditor
                file={file}
                storageOk={storageOk}
                onUpdate={(content) =>
                  setDesktop((d) => ({
                    ...d,
                    files: d.files.map((f) =>
                      f.id === file.id ? { ...f, content, modified: new Date().toISOString() } : f,
                    ),
                  }))
                }
                onRename={() =>
                  setFileAction({ kind: 'rename', id: file.id, parentId: file.parentId })
                }
                onSaved={() =>
                  setToast(
                    storageOk
                      ? t('Noten er gemt i denne browser.', 'Your note is saved in this browser.')
                      : t(
                          'Lokal lagring er fuld eller blokeret. Download noten for at beholde den.',
                          'Local storage is full or blocked. Download your note to keep it.',
                        ),
                  )
                }
              />
            ) : w.app === 'settings' ? (
              <div className="settings-app">
                <div className="content-heading">
                  <div>
                    <div className="eyebrow">GABRIEL OS / CONTROL CENTER</div>
                    <h1>{t('Dit skrivebord. Din stil.', 'Your desktop. Your style.')}</h1>
                    <p>
                      {t(
                        'Små indstillinger, der gør det lidt mere dit.',
                        'Small settings that make it feel more like you.',
                      )}
                    </p>
                  </div>
                </div>
                <div className="settings-content">
                  <section>
                    <h2>{t('Sprog', 'Language')}</h2>
                    <p>
                      {t(
                        'CV og skrivebord følger dit valg. Terminalkommandoer er altid på engelsk.',
                        'The CV and desktop follow your choice. Terminal commands always stay in English.',
                      )}
                    </p>
                    <div className="settings-options">
                      {(['da', 'en'] as const).map((lang) => (
                        <button
                          key={lang}
                          className={language === lang ? 'selected' : ''}
                          aria-pressed={language === lang}
                          onClick={() => setLanguage(lang)}
                        >
                          {lang === 'da' ? 'Dansk' : 'English'}
                        </button>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h2>{t('Baggrund', 'Wallpaper')}</h2>
                    <div className="wallpaper-options">
                      {(['blue', 'graphite', 'violet'] as const).map((color) => (
                        <button
                          className={`wallpaper-choice choice-${color} ${desktop.wallpaper === color ? 'selected' : ''}`}
                          key={color}
                          aria-pressed={desktop.wallpaper === color}
                          onClick={() => setDesktop((d) => ({ ...d, wallpaper: color }))}
                        >
                          <DesktopMark />
                          <span>
                            {color === 'blue'
                              ? t('Midnatsblå', 'Midnight blue')
                              : color === 'graphite'
                                ? t('Grafit', 'Graphite')
                                : t('Violet', 'Violet')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h2>{t('Skrivebord & filer', 'Desktop & files')}</h2>
                    <p>
                      {desktop.files.length}{' '}
                      {t(
                        'lokale elementer. Noter, mapper og ikonplaceringer gemmes i denne browser. De sendes ikke til Gabriel.',
                        'local items. Notes, folders, and icon positions are saved in this browser. They are not sent to Gabriel.',
                      )}
                    </p>
                    <button className="primary-button" onClick={arrange}>
                      <Grid2X2 size={14} />
                      {t('Arrangér ikoner', 'Arrange icons')}
                    </button>
                    <p className={storageOk ? 'green-text' : 'editor-warning'}>
                      {storageOk
                        ? t('Lokal lagring er tilgængelig.', 'Local storage is available.')
                        : t(
                            'Lokal lagring er blokeret eller fuld. Download dine noter inden du forlader siden.',
                            'Local storage is blocked or full. Download your notes before leaving.',
                          )}
                    </p>
                  </section>
                </div>
              </div>
            ) : (
              <FileManager
                key={w.section ?? w.app}
                section={(w.section ?? w.app) as Section}
                onNavigate={(section) => patch(w.id, { section })}
              />
            )}
          </Window>
        );
      })}
      <div className="desktop-bottom-note">
        <span className="status-dot" />
        {t('Alle systemer nysgerrige.', 'All systems curious.')}
        <button onClick={() => togglePopover('guide')}>
          {t('Højreklik for at udforske', 'Right-click to explore')}
          <CircleHelp size={11} />
        </button>
      </div>
      <footer className="taskbar">
        <button
          className={`show-desktop ${showDesktop ? 'selected' : ''}`}
          title={t('Vis / gendan skrivebord', 'Show / restore desktop')}
          aria-label={t('Vis eller gendan skrivebord', 'Show or restore desktop')}
          onClick={toggleDesktop}
        >
          <Monitor size={18} />
        </button>
        <span className="panel-divider" />
        <div className="taskbar-windows">
          {windows.map((w) => (
            <button
              className={`task-button ${active === w.id ? 'active' : ''} ${w.minimized ? 'minimized' : ''}`}
              key={w.id}
              aria-label={`${w.minimized ? t('Gendan', 'Restore') : t('Skift til', 'Switch to')} ${title(w)}`}
              onClick={() => {
                if (active === w.id) patch(w.id, { minimized: true });
                else {
                  patch(w.id, { minimized: false, z: ++nextZ.current });
                  setShowDesktop(false);
                }
              }}
            >
              <AppIcon id={w.section ?? w.app} size={16} />
              <span>
                {w.nodeId
                  ? desktop.files.find((f) => f.id === w.nodeId)?.name
                  : label(w.section ?? w.app)}
              </span>
              <span className="task-dot" />
            </button>
          ))}
        </div>
        <button
          className="taskbar-create"
          aria-label={t('Opret på skrivebordet', 'Create on desktop')}
          onClick={() => fileMenu(innerWidth - 235, innerHeight - 335)}
        >
          <FolderPlus size={17} />
        </button>
        <button
          className="taskbar-download"
          aria-label={t('Hent CV', 'Download CV')}
          onClick={() => downloadCV(language)}
        >
          <ArrowDownToLine size={14} />
          <span>{t('Hent CV', 'Download CV')}</span>
        </button>
      </footer>
      {popover === 'power' && (
        <div className="system-popover power-menu">
          <div className="eyebrow">GABRIEL OS</div>
          <h2>{t('Afslut session', 'End session')}</h2>
          <p>{t('Dine lokale filer bliver bevaret.', 'Your local files will be kept.')}</p>
          <button onClick={() => shutDown(true)}>
            <RotateCcw size={17} />
            <span>
              {t('Genstart', 'Restart')}
              <small>{t('En frisk start på skrivebordet', 'A fresh desktop session')}</small>
            </span>
          </button>
          <button onClick={() => shutDown()}>
            <Power size={17} />
            <span>
              {t('Sluk computer', 'Shut down computer')}
              <small>
                {t('Du kan tænde igen når som helst', 'You can power on again at any time')}
              </small>
            </span>
          </button>
        </div>
      )}
      {popover === 'network' && (
        <div className="system-popover network-menu">
          <Wifi size={26} />
          <h2>
            {online ? t('Du er online', 'You’re online') : t('Du er offline', 'You’re offline')}
          </h2>
          <p>
            {online
              ? t(
                  'Skrivebordet bruger din browsers internetforbindelse.',
                  'The desktop uses your browser’s internet connection.',
                )
              : t(
                  'Du kan stadig læse det indlæste CV og arbejde i dine noter.',
                  'You can still read the loaded CV and work on your notes.',
                )}
          </p>
          <button className="primary-button" onClick={() => open('browser')}>
            <Globe2 size={15} />
            {t('Åbn browser', 'Open browser')}
          </button>
        </div>
      )}
      {popover === 'sound' && (
        <div className="system-popover sound-menu">
          <h2>{t('Lyd', 'Sound')}</h2>
          <label htmlFor="volume">
            {t('Lydstyrke i skrivebordet', 'Desktop volume')}
            <strong>{volume}%</strong>
          </label>
          <input
            id="volume"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
          <div className="sound-actions">
            <button onClick={() => setVolume(volume ? 0 : 35)}>
              {volume ? <VolumeX size={16} /> : <Volume2 size={16} />}{' '}
              {volume ? t('Slå lyd fra', 'Mute') : t('Slå lyd til', 'Unmute')}
            </button>
            <button className="primary-button" onClick={testSound}>
              {t('Test lyd', 'Test sound')}
            </button>
          </div>
          <p>
            {t('Ændrer kun lyden fra dette skrivebord.', 'Only changes audio from this desktop.')}
          </p>
        </div>
      )}
      {popover === 'calendar' && (
        <div className="system-popover calendar-popover">
          <div className="calendar-clock">
            {time.toLocaleTimeString(language === 'da' ? 'da-DK' : 'en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <p>
            {time.toLocaleDateString(language === 'da' ? 'da-DK' : 'en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <div className="calendar-month">
            <button
              aria-label={t('Forrige måned', 'Previous month')}
              onClick={() => setCalendarOffset((v) => v - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <strong>
              {calendarDate.toLocaleDateString(language === 'da' ? 'da-DK' : 'en-GB', {
                month: 'long',
                year: 'numeric',
              })}
            </strong>
            <button
              aria-label={t('Næste måned', 'Next month')}
              onClick={() => setCalendarOffset((v) => v + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="calendar-grid">
            {(language === 'da'
              ? ['M', 'T', 'O', 'T', 'F', 'L', 'S']
              : ['M', 'T', 'W', 'T', 'F', 'S', 'S']
            ).map((day, i) => (
              <small key={i}>{day}</small>
            ))}
            {Array.from({ length: startDay }, (_, i) => (
              <span key={`empty${i}`} />
            ))}
            {Array.from({ length: monthDays }, (_, i) => (
              <span
                className={calendarOffset === 0 && i + 1 === time.getDate() ? 'today' : ''}
                key={i}
              >
                {i + 1}
              </span>
            ))}
          </div>
          <button className="calendar-today" onClick={() => setCalendarOffset(0)}>
            {t('Tilbage til i dag', 'Back to today')}
          </button>
        </div>
      )}
      {popover === 'guide' && (
        <aside className="desktop-guide">
          <button
            aria-label={t('Luk guide', 'Close guide')}
            className="guide-close"
            onClick={() => setPopover(null)}
          >
            <X size={17} />
          </button>
          <div className="eyebrow">{t('VELKOMMEN INDENFOR', 'MAKE YOURSELF AT HOME')}</div>
          <h2>
            {t('Mere end et CV.', 'More than a CV.')}
            <br />
            {t('Et sted at gå på opdagelse.', 'A place to explore.')}
          </h2>
          <p>
            <AppIcon id="terminal" size={18} />
            <span>
              <strong>{t('Følg prompten.', 'Follow the prompt.')}</strong>
              {t(
                'Skriv /help. I kommandofeltet er ↑↓ historik; i resultater er ↑↓ valg og Enter åbner.',
                'Type /help. At the prompt, ↑↓ browses history; in results, ↑↓ selects and Enter opens.',
              )}
            </span>
          </p>
          <p>
            <Grid2X2 size={18} />
            <span>
              <strong>{t('Gør det til dit.', 'Make it yours.')}</strong>
              {t(
                'Klik for at åbne. Træk ikoner og vinduer. Højreklik for at oprette, omdøbe eller slette dine egne filer. På touch: hold et ikon nede, eller brug + i proceslinjen.',
                'Click to open. Drag icons and windows. Right-click to create, rename, or delete your own files. On touch, hold an icon or use + in the taskbar.',
              )}
            </span>
          </p>
          <p>
            <HardDrive size={18} />
            <span>
              {t(
                'Dine filer gemmes kun i denne browser. Alt+pil flytter det markerede ikon med tastaturet.',
                'Your files stay in this browser. Alt+arrow moves the focused icon with the keyboard.',
              )}
            </span>
          </p>
          <small>
            {t(
              'Et virtuelt skrivebord i browseren. Ændrer ikke din computers filer eller indstillinger.',
              'A virtual desktop in your browser. Does not change your computer’s files or settings.',
            )}
          </small>
        </aside>
      )}
      {context && (
        <div
          ref={contextRef}
          className="context-menu"
          role="menu"
          aria-label={t('Skrivebordsmenu', 'Desktop menu')}
          style={{ left: context.x, top: context.y }}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
              e.preventDefault();
              const buttons = Array.from(
                contextRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [],
              );
              const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
              const next =
                e.key === 'Home'
                  ? 0
                  : e.key === 'End'
                    ? buttons.length - 1
                    : (i + (e.key === 'ArrowDown' ? 1 : buttons.length - 1)) % buttons.length;
              buttons[next]?.focus();
            }
            if (e.key === 'Escape') {
              e.stopPropagation();
              setContext(null);
            }
          }}
        >
          <div className="context-heading">
            {contextFile?.name ?? (contextApp ? label(contextApp) : t('Skrivebord', 'Desktop'))}
          </div>
          {(contextFile || contextApp) && (
            <>
              <button
                role="menuitem"
                onClick={() => (contextFile ? openFile(contextFile) : open(contextApp!))}
              >
                <Folder size={15} />
                {t('Åbn', 'Open')}
              </button>
              {contextFile && (
                <>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setFileAction({
                        kind: 'rename',
                        id: contextFile.id,
                        parentId: contextFile.parentId,
                      });
                      setContext(null);
                    }}
                  >
                    <Pencil size={14} />
                    {t('Omdøb', 'Rename')}
                  </button>
                  {contextFile.parentId && (
                    <button role="menuitem" onClick={() => moveFile(contextFile.id, null)}>
                      <Monitor size={14} />
                      {t('Flyt til skrivebord', 'Move to desktop')}
                    </button>
                  )}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setFileAction({
                        kind: 'delete',
                        id: contextFile.id,
                        parentId: contextFile.parentId,
                      });
                      setContext(null);
                    }}
                  >
                    <Trash2 size={14} />
                    {t('Slet', 'Delete')}
                  </button>
                </>
              )}
              <div className="context-divider" />
            </>
          )}
          <button
            role="menuitem"
            onClick={() =>
              newFile('folder', contextFile?.kind === 'folder' ? contextFile.id : context.parentId)
            }
          >
            <FolderPlus size={15} />
            {t('Ny mappe', 'New folder')}
          </button>
          <button
            role="menuitem"
            onClick={() =>
              newFile('text', contextFile?.kind === 'folder' ? contextFile.id : context.parentId)
            }
          >
            <FilePlus2 size={15} />
            {t('Ny tekstfil', 'New text file')}
          </button>
          <div className="context-divider" />
          <button role="menuitem" onClick={arrange}>
            <Grid2X2 size={14} />
            {t('Arrangér ikoner', 'Arrange icons')}
          </button>
          <button role="menuitem" onClick={() => open('settings')}>
            <Settings2 size={14} />
            {t('Skrivebordsindstillinger', 'Desktop settings')}
          </button>
          <button role="menuitem" onClick={() => open('browser')}>
            <Globe2 size={14} />
            {t('Åbn browser', 'Open browser')}
          </button>
        </div>
      )}
      {fileAction && (
        <FileDialog
          action={fileAction}
          files={desktop.files}
          onSubmit={submitFile}
          onClose={() => setFileAction(null)}
        />
      )}
      {(!storageOk || toast) && (
        <div className="desktop-toast" role="status">
          <ShieldCheck size={15} />
          <span>
            {toast ||
              t(
                'Lokal lagring er utilgængelig. Download noter for at beholde dem.',
                'Local storage is unavailable. Download notes to keep them.',
              )}
          </span>
          <button aria-label={t('Luk besked', 'Dismiss notification')} onClick={() => setToast('')}>
            <X size={13} />
          </button>
        </div>
      )}
    </main>
  );
}
