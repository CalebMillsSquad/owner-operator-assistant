type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export function BrandMark({ compact = false, className = "" }: BrandMarkProps) {
  return (
    <div className={`brand-mark ${compact ? "brand-mark-compact" : ""} ${className}`}>
      <svg className="brand-mark-svg" viewBox="0 0 72 72" role="img" aria-labelledby="brand-mark-title brand-mark-desc">
        <title id="brand-mark-title">TRUSTed Dispatching emblem</title>
        <desc id="brand-mark-desc">A forward-moving semi-truck inside a protective shield.</desc>
        <path className="brand-mark-shield" d="M36 4 61 13v20c0 16-9.5 27.8-25 35C20.5 60.8 11 49 11 33V13L36 4Z" />
        <path className="brand-mark-road" d="M22 55h28M29 48h14" />
        <path className="brand-mark-truck" d="M20 38h28V27H20v11Zm28-7h7l6 6v8H48V31Z" />
        <path className="brand-mark-window" d="M51 33h4l3 4h-7v-4Z" />
        <circle className="brand-mark-wheel" cx="28" cy="47" r="4" />
        <circle className="brand-mark-wheel" cx="51" cy="47" r="4" />
        <path className="brand-mark-motion" d="M14 29h-5m7-6H9" />
      </svg>
    </div>
  );
}
