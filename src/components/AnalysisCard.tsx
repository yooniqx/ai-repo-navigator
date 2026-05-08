import type { ReactNode } from "react";

export function AnalysisCard({
  title,
  icon,
  children,
  delay = 0,
  className = "",
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`glass rounded-2xl p-6 animate-fade-up hover:border-primary/40 transition-colors ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-lg flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
          {icon}
        </div>
        <h2 className="font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}
