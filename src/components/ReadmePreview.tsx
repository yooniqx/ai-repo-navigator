import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface ReadmePreviewProps {
  content: string;
}

export function ReadmePreview({ content }: ReadmePreviewProps) {
  if (!content) return null;

  const components: Components = {
    // Customize heading styles to match dark theme
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold text-foreground mb-4 mt-6 first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold text-foreground mb-3 mt-5 first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold text-foreground mb-2 mt-4 first:mt-0">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-semibold text-foreground mb-2 mt-3 first:mt-0">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-sm font-semibold text-foreground mb-2 mt-3 first:mt-0">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-sm font-semibold text-muted-foreground mb-2 mt-3 first:mt-0">
        {children}
      </h6>
    ),
    // Style paragraphs
    p: ({ children }) => (
      <p className="text-foreground/90 leading-7 mb-4">{children}</p>
    ),
    // Style links
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
      >
        {children}
      </a>
    ),
    // Style code blocks
    code: ({ className, children, ...props }) => {
      const inline = !className;
      if (inline) {
        return (
          <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-mono">
            {children}
          </code>
        );
      }
      return (
        <code className={`${className || ''} block bg-background/80 text-foreground/90 p-3 rounded-md text-xs font-mono overflow-x-auto`}>
          {children}
        </code>
      );
    },
    // Style pre blocks (code blocks)
    pre: ({ children }) => (
      <pre className="bg-background/80 border border-border/50 rounded-md p-3 mb-4 overflow-x-auto">
        {children}
      </pre>
    ),
    // Style lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside text-foreground/90 mb-4 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside text-foreground/90 mb-4 space-y-1">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-foreground/90 leading-7">{children}</li>
    ),
    // Style blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground mb-4">
        {children}
      </blockquote>
    ),
    // Style tables
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-border/50 rounded-md">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-primary/10">{children}</thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr className="border-b border-border/50">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2 text-sm text-foreground/90">{children}</td>
    ),
    // Style horizontal rules
    hr: () => <hr className="border-border/50 my-6" />,
    // Style images (badges, etc.)
    img: ({ src, alt }) => (
      <img
        src={src}
        alt={alt || ''}
        className="inline-block max-w-full h-auto my-2"
        loading="lazy"
      />
    ),
    // Style strong/bold text
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    // Style emphasis/italic text
    em: ({ children }) => (
      <em className="italic text-foreground/90">{children}</em>
    ),
  };

  return (
    <details className="mt-4 group">
      <summary className="cursor-pointer text-xs font-mono text-primary hover:text-primary/80 transition-colors">
        README excerpt ▾
      </summary>
      <div className="mt-3 p-4 rounded-lg bg-background/60 border border-border/50 overflow-x-auto">
        <div className="prose prose-sm prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </details>
  );
}

// Made with Bob
