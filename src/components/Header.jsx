import { formatDisplayDate } from '../utils/dateHelpers';
import Logo from './Logo';

export default function Header() {
  const today = formatDisplayDate(new Date());

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <div className="min-w-0">
          <Logo />
          <p className="mt-1 hidden text-sm text-slate-500 sm:block">
            Job Selector · Manufacturing sheets
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Today
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-700 sm:text-base">{today}</p>
        </div>
      </div>
    </header>
  );
}
