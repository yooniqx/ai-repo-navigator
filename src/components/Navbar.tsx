import { Logo } from "./Logo";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/50">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="/#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="/#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
          <a href="https://github.com/yooniqx/ai-repo-navigator.git" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
        </nav>
      </div>
    </header>
  );
}
