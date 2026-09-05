import { useEffect, useRef, useState } from 'react';
import { FileText, Folder, X } from 'lucide-react';
import { useLocale } from '../Locale';
import { descendants, validateName, type DesktopFile } from '../desktop';
export interface FileAction {
  kind: 'folder' | 'text' | 'rename' | 'delete';
  parentId: string | null;
  id?: string;
  x?: number;
  y?: number;
}
export function FileDialog({
  action,
  files,
  onSubmit,
  onClose,
}: {
  action: FileAction;
  files: DesktopFile[];
  onSubmit: (name: string) => void;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const file = files.find((f) => f.id === action.id);
  const [name, setName] = useState(
    file?.name ??
      (action.kind === 'folder' ? t('Ny mappe', 'New folder') : t('Noter.txt', 'Notes.txt')),
  );
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const modal = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    input.current?.select();
    if (action.kind === 'delete')
      modal.current?.querySelector<HTMLButtonElement>('.cancel-button')?.focus();
    return () => {
      previous?.focus?.();
    };
  }, [action.kind]);
  const title =
    action.kind === 'delete'
      ? t('Slet element', 'Delete item')
      : action.kind === 'rename'
        ? t('Omdøb element', 'Rename item')
        : action.kind === 'folder'
          ? t('Ny mappe', 'New folder')
          : t('Ny tekstfil', 'New text file');
  return (
    <div
      className="modal-scrim"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modal}
        className="file-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="file-dialog-title"
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Escape') onClose();
          if (e.key === 'Tab') {
            const nodes = Array.from(
              modal.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input') ?? [],
            );
            if (e.shiftKey && document.activeElement === nodes[0]) {
              e.preventDefault();
              nodes.at(-1)?.focus();
            } else if (!e.shiftKey && document.activeElement === nodes.at(-1)) {
              e.preventDefault();
              nodes[0]?.focus();
            }
          }
        }}
      >
        <button
          className="guide-close"
          aria-label={t('Luk dialog', 'Close dialog')}
          onClick={onClose}
        >
          <X size={17} />
        </button>
        <div className="dialog-symbol">
          {action.kind === 'folder' ? <Folder size={28} /> : <FileText size={26} />}
        </div>
        <h2 id="file-dialog-title">{title}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (action.kind !== 'delete') {
              const issue = validateName(name, files, action.parentId, action.id);
              if (issue) {
                setError(
                  issue === 'duplicate'
                    ? t(
                        'Der findes allerede et element med det navn.',
                        'An item with this name already exists.',
                      )
                    : t('Brug 1–80 tegn uden skråstreger.', 'Use 1–80 characters without slashes.'),
                );
                return;
              }
            }
            onSubmit(name.trim());
          }}
        >
          {action.kind === 'delete' ? (
            <p>
              {t('Slet', 'Delete')} “{file?.name}”
              {file?.kind === 'folder'
                ? ` ${t('og indholdet', 'and its contents')} (${descendants(files, file.id).length - 1})`
                : ''}
              ? {t('Dette kan ikke fortrydes.', 'This cannot be undone.')}
            </p>
          ) : (
            <>
              <label htmlFor="file-name">{t('Navn', 'Name')}</label>
              <input
                id="file-name"
                ref={input}
                value={name}
                maxLength={80}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                autoComplete="off"
              />
              <p className="dialog-hint">
                {t(
                  'Gemmes på dit virtuelle skrivebord, kun i denne browser.',
                  'Saved on your virtual desktop, only in this browser.',
                )}
              </p>
            </>
          )}
          {error && (
            <p className="browser-error" role="alert">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              {t('Annuller', 'Cancel')}
            </button>
            <button
              type="submit"
              className={`primary-button ${action.kind === 'delete' ? 'danger-button' : ''}`}
            >
              {action.kind === 'delete'
                ? t('Slet', 'Delete')
                : action.kind === 'rename'
                  ? t('Gem navn', 'Save name')
                  : t('Opret', 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
