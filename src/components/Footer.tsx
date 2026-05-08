export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-24">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} RepoMind — built for developers.</p>
        <div className="flex items-center gap-5">
          <a href="/#how-it-works" className="hover:text-foreground transition-colors">Docs</a>
          <a href="/#developer-features" className="hover:text-foreground transition-colors">API</a>
          <a
            href="https://github.com/yooniqx/nicoteX"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
