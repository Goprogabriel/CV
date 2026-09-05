import {
  ArrowDownToLine,
  ArrowLeft,
  FilePlus2,
  FileText,
  Folder,
  FolderPlus,
  HardDrive,
  Home,
  Pencil,
  Save,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useLocale } from '../Locale';
import type { DesktopFile } from '../desktop';
import { downloadText } from '../content/cv';
export function LocalFiles({
  files,
  folderId,
  onOpen,
  onNew,
  onContext,
  onMove,
  onNavigate,
}: {
  files: DesktopFile[];
  folderId?: string;
  onNavigate: (parentId: string | null) => void;
  onOpen: (file: DesktopFile) => void;
  onNew: (kind: 'folder' | 'text', parentId: string | null) => void;
  onContext: (x: number, y: number, id?: string, parentId?: string | null) => void;
  onMove: (id: string, parentId: string | null) => void;
}) {
  const { t } = useLocale();
  const parent = folderId ?? null;
  const setParent = onNavigate;
  const folder = files.find((f) => f.id === parent);
  const items = files.filter((f) => f.parentId === parent);
  return (
    <div
      className="local-files file-manager"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContext(e.clientX, e.clientY, undefined, parent);
      }}
    >
      <div className="file-toolbar">
        <button
          aria-label={t('Tilbage til overmappe', 'Back to parent folder')}
          disabled={!parent}
          onClick={() => setParent(folder?.parentId ?? null)}
        >
          <ArrowLeft size={17} />
        </button>
        <div className="breadcrumb">
          <Home size={14} />
          <button onClick={() => setParent(null)}>{t('Mine filer', 'My files')}</button>
          {folder && (
            <>
              <span>/</span>
              <span>{folder.name}</span>
            </>
          )}
        </div>
        <button
          aria-label={t('Ny mappe', 'New folder')}
          title={t('Ny mappe', 'New folder')}
          onClick={() => onNew('folder', parent)}
        >
          <FolderPlus size={18} />
        </button>
        <button
          aria-label={t('Ny tekstfil', 'New text file')}
          title={t('Ny tekstfil', 'New text file')}
          onClick={() => onNew('text', parent)}
        >
          <FilePlus2 size={17} />
        </button>
      </div>
      <div className="local-file-body">
        <div className="local-folder-heading">
          <div className="eyebrow">/home/gabriel/{parent ? 'documents' : 'desktop'}</div>
          <h1>{folder?.name ?? t('Mine filer', 'My files')}</h1>
          <p>
            {t(
              'Dit eget lille arbejdsområde. Gemmes kun i denne browser.',
              'Your own little workspace. Saved only in this browser.',
            )}
          </p>
        </div>
        {items.length ? (
          <div className="local-file-grid">
            {items.map((file) => (
              <button
                key={file.id}
                onClick={() => (file.kind === 'folder' ? setParent(file.id) : onOpen(file))}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onContext(e.clientX, e.clientY, file.id, parent);
                }}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/x-gabriel-file', file.id);
                }}
                onDragOver={(e) => {
                  if (file.kind === 'folder') e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const id = e.dataTransfer.getData('application/x-gabriel-file');
                  if (id && file.kind === 'folder') onMove(id, file.id);
                }}
              >
                {file.kind === 'folder' ? <Folder size={43} /> : <FileText size={39} />}
                <strong>{file.name}</strong>
                <span>
                  {file.kind === 'folder'
                    ? `${files.filter((f) => f.parentId === file.id).length} ${t('elementer', 'items')}`
                    : `${new Blob([file.content]).size} B`}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-folder">
            <Folder size={49} />
            <h2>{t('Plads til en ny idé.', 'Room for a new idea.')}</h2>
            <p>
              {t(
                'Højreklik her, eller opret din første fil nedenfor.',
                'Right-click here, or create your first file below.',
              )}
            </p>
            <button className="primary-button" onClick={() => onNew('text', parent)}>
              <FilePlus2 size={15} />
              {t('Opret tekstfil', 'Create text file')}
            </button>
          </div>
        )}
      </div>
      <footer className="file-status">
        <span>
          {items.length} {t('elementer', 'items')}
        </span>
        <span>
          <HardDrive size={11} />
          {t('Denne session', 'This session')}
        </span>
      </footer>
    </div>
  );
}
export function TextEditor({
  file,
  onUpdate,
  onRename,
  onSaved,
  storageOk,
}: {
  file: DesktopFile;
  onUpdate: (text: string) => void;
  onRename: () => void;
  onSaved: () => void;
  storageOk: boolean;
}) {
  const { t } = useLocale();
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const lineNumbers = useRef<HTMLDivElement>(null);
  return (
    <div className="text-editor">
      <div className="editor-toolbar">
        <span>
          <FileText size={14} />
          {file.name}
        </span>
        <button onClick={onSaved}>
          <Save size={14} />
          {t('Gem', 'Save')}
        </button>
        <button
          onClick={onRename}
          aria-label={t('Omdøb fil', 'Rename file')}
          title={t('Omdøb fil', 'Rename file')}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => downloadText(file.name, file.content)}
          aria-label={t('Download tekstfil', 'Download text file')}
          title={t('Download tekstfil', 'Download text file')}
        >
          <ArrowDownToLine size={15} />
        </button>
      </div>
      <div className="editor-document">
        <div ref={lineNumbers} className="editor-margin" aria-hidden="true">
          {file.content.split('\n').map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          aria-label={t('Tekstindhold', 'Text content')}
          value={file.content}
          maxLength={100000}
          onScroll={(e) => {
            if (lineNumbers.current)
              lineNumbers.current.style.transform = `translateY(-${e.currentTarget.scrollTop}px)`;
          }}
          spellCheck
          onChange={(e) => onUpdate(e.target.value)}
          onSelect={(e) => {
            const text = e.currentTarget.value.slice(0, e.currentTarget.selectionStart);
            setCursor({
              line: text.split('\n').length,
              column: (text.split('\n').at(-1)?.length ?? 0) + 1,
            });
          }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
              e.preventDefault();
              onSaved();
            }
            if (e.key === 'Tab' && !e.shiftKey && file.content.length < 99998) {
              e.preventDefault();
              const el = e.currentTarget;
              const start = el.selectionStart;
              onUpdate(file.content.slice(0, start) + '  ' + file.content.slice(el.selectionEnd));
              requestAnimationFrame(() => {
                el.selectionStart = el.selectionEnd = start + 2;
              });
            }
          }}
          placeholder={t('Skriv noget, du vil huske…', 'Write something worth remembering…')}
        />
      </div>
      <footer className="file-status">
        <span>
          {t('Linje', 'Line')} {cursor.line}, {t('kolonne', 'column')} {cursor.column}
        </span>
        <span>
          {file.content.length.toLocaleString()} {t('tegn', 'characters')} · UTF-8
        </span>
        <span className={storageOk ? 'green-text' : 'editor-warning'}>
          {storageOk
            ? t('Gemt automatisk', 'Autosaved')
            : t('Kun denne session', 'This session only')}
        </span>
      </footer>
    </div>
  );
}
