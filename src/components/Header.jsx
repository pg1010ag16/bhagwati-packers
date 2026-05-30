import { formatDisplayDate } from '../utils/dateHelpers';

export default function Header() {
  const today = formatDisplayDate(new Date());

  return (
    <header className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 text-white shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-primary-100/90 sm:text-sm">
            Job Selector Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Bhagwati Packers
          </h1>
          <p className="mt-1 text-sm text-primary-100 sm:text-base">
            Select jobs, add remarks, and generate manufacturing sheets
          </p>
        </div>
        <div className="shrink-0 rounded-xl bg-white/15 px-4 py-3 text-right backdrop-blur-sm sm:px-5">
          <p className="text-xs font-medium uppercase tracking-wide text-primary-100">
            Today
          </p>
          <p className="mt-0.5 text-sm font-semibold sm:text-base">{today}</p>
        </div>
      </div>
    </header>
  );
}
