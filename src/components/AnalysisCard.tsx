import { useState, type ReactNode } from "react";

export function AnalysisCard({
  title,
  icon,
  children,
  delay = 0,
  className = "",
  expandable = false,
  defaultOpen = true,
  subtitle,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  delay?: number;
  className?: string;
  expandable?: boolean;
  defaultOpen?: boolean;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={`glass rounded-2xl p-6 animate-fade-up hover:border-primary/40 hover:shadow-glow transition-all duration-300 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        type="button"
        onClick={() => expandable && setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 mb-4 text-left ${expandable ? "cursor-pointer" : "cursor-default"}`}
        aria-expanded={open}
      >
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center text-primary-foreground shrink-0"
          style={{ background: "var(--gradient-primary)" }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{subtitle}</p>}
        </div>
        {expandable && (
          <span className={`text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        )}
      </button>
      <div
        className={`text-sm text-muted-foreground leading-relaxed grid transition-all duration-300 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
