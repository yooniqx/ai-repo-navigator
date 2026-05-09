// Decorative, fixed, pointer-events-none background layer.
// Lightweight: pure CSS animations, no JS loops, runs behind everything.

const SYMBOLS = [
  { c: "{ }",      x: "6%",  y: "12%", size: 56, dur: 26, delay: 0,  drift: "a" },
  { c: "</>",      x: "88%", y: "18%", size: 44, dur: 32, delay: 4,  drift: "b" },
  { c: "$_",       x: "14%", y: "78%", size: 38, dur: 28, delay: 2,  drift: "c" },
  { c: "[ ]",      x: "78%", y: "70%", size: 50, dur: 30, delay: 6,  drift: "a" },
  { c: "( )",      x: "46%", y: "88%", size: 40, dur: 34, delay: 1,  drift: "b" },
  { c: "//",       x: "30%", y: "30%", size: 36, dur: 24, delay: 3,  drift: "c" },
  { c: "★",        x: "62%", y: "8%",  size: 28, dur: 22, delay: 5,  drift: "a" },
  { c: "⌥",        x: "92%", y: "50%", size: 32, dur: 30, delay: 7,  drift: "b" },
  { c: ">_",       x: "4%",  y: "44%", size: 42, dur: 28, delay: 2,  drift: "c" },
  { c: "git",      x: "70%", y: "36%", size: 24, dur: 36, delay: 4,  drift: "a" },
  { c: "λ",        x: "22%", y: "58%", size: 46, dur: 26, delay: 6,  drift: "b" },
  { c: "•",        x: "55%", y: "55%", size: 18, dur: 20, delay: 0,  drift: "c" },
];

function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...props}>
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4l2 2H19.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-11Z" />
    </svg>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

function NodeDot({ x, y, size = 6, delay = 0 }: { x: string; y: string; size?: number; delay?: number }) {
  return (
    <span
      className="absolute rounded-full bg-primary/70 animate-node-pulse"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        boxShadow: "0 0 18px 4px oklch(0.78 0.18 155 / 35%)",
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      {/* Soft ambient gradient orbs */}
      <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-primary/15 blur-[120px] animate-orb-a" />
      <div className="absolute -bottom-48 -right-32 h-[520px] w-[520px] rounded-full bg-primary/10 blur-[140px] animate-orb-b" />
      <div className="absolute top-1/3 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-emerald-400/5 blur-[120px] animate-orb-c" />

      {/* Connection lines (parallax SVG) */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.18] animate-parallax-slow"
        preserveAspectRatio="none"
        viewBox="0 0 1000 800"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.18 155)" stopOpacity="0" />
            <stop offset="50%" stopColor="oklch(0.78 0.18 155)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="oklch(0.78 0.18 155)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke="url(#lineGrad)" strokeWidth="1" fill="none">
          <path d="M50 120 Q300 200 520 160 T960 240" />
          <path d="M80 600 Q280 500 540 580 T940 520" />
          <path d="M200 80 Q360 360 600 380 T880 700" />
        </g>
      </svg>

      {/* Floating glowing nodes */}
      <NodeDot x="18%" y="22%" size={6} delay={0} />
      <NodeDot x="42%" y="68%" size={5} delay={1.5} />
      <NodeDot x="74%" y="28%" size={7} delay={3} />
      <NodeDot x="86%" y="78%" size={5} delay={2} />
      <NodeDot x="10%" y="86%" size={6} delay={4} />

      {/* Folder & file icons */}
      <FolderIcon className="absolute text-primary/25 h-12 w-12 animate-drift-a" style={{ left: "8%", top: "32%", animationDelay: "1s" } as React.CSSProperties} />
      <FileIcon   className="absolute text-primary/20 h-10 w-10 animate-drift-b" style={{ left: "82%", top: "60%", animationDelay: "3s" } as React.CSSProperties} />
      <FolderIcon className="absolute text-primary/15 h-9 w-9  animate-drift-c" style={{ left: "60%", top: "20%", animationDelay: "5s" } as React.CSSProperties} />
      <FileIcon   className="absolute text-primary/20 h-8 w-8  animate-drift-a" style={{ left: "36%", top: "76%", animationDelay: "2s" } as React.CSSProperties} />

      {/* Floating dev symbols */}
      {SYMBOLS.map((s, i) => (
        <span
          key={i}
          className={`absolute font-mono text-primary/20 blur-[0.3px] animate-drift-${s.drift}`}
          style={{
            left: s.x,
            top: s.y,
            fontSize: s.size,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
            textShadow: "0 0 24px oklch(0.78 0.18 155 / 30%)",
          }}
        >
          {s.c}
        </span>
      ))}
    </div>
  );
}
