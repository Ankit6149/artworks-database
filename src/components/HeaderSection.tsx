interface HeaderSectionProps {
  title: string;
  subtitle: string;
}

export function HeaderSection({ title, subtitle }: HeaderSectionProps) {
  return (
    <header className="mb-2">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-800 truncate">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
          {subtitle}
        </p>
      </div>
    </header>
  );
}
