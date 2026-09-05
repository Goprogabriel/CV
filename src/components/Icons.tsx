import {
  BriefcaseBusiness,
  Code2,
  FileText,
  Mail,
  Terminal,
  UserRound,
  Wrench,
  Globe2,
  Folder,
  Settings2,
  NotebookPen,
  type LucideProps,
} from 'lucide-react';
import type { AppId } from '../content/cv';
export function AppIcon({ id, ...props }: LucideProps & { id: AppId }) {
  const Icon = {
    about: UserRound,
    projects: Code2,
    experience: BriefcaseBusiness,
    skills: Wrench,
    contact: Mail,
    cv: FileText,
    terminal: Terminal,
    browser: Globe2,
    files: Folder,
    settings: Settings2,
    editor: NotebookPen,
  }[id];
  return <Icon {...props} />;
}
export function FolderIcon({ id }: { id: AppId }) {
  return (
    <span className={`folder-icon folder-${id}`}>
      <svg viewBox="0 0 72 58" aria-hidden="true">
        <defs>
          <linearGradient id={`folder-${id}`} x2="0" y2="1">
            <stop stopColor="#78b3ef" />
            <stop offset="1" stopColor="#3774b9" />
          </linearGradient>
        </defs>
        <path d="M5 10a5 5 0 0 1 5-5h17l7 7h28a5 5 0 0 1 5 5v32H5Z" fill="#35679d" />
        <path
          d="M5 20a5 5 0 0 1 5-5h52a5 5 0 0 1 5 5v29a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5Z"
          fill={`url(#folder-${id})`}
          stroke="#a9d5ff"
          strokeOpacity=".28"
        />
        <path d="M9 18h54" stroke="#d1e7ff" strokeOpacity=".4" />
      </svg>
      <AppIcon id={id} />
    </span>
  );
}
export function DesktopMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path
        d="M14 66 44 29 66 30 56 42 84 47 66 53 86 71 54 58 46 43 29 65 46 65 59 79 36 74 14 83 23 70Z"
        fill="currentColor"
      />
      <path
        d="m41 23 24-3 11 10-17-4M68 38l21 1-14 5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
