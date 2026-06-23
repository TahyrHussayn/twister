/**
 * code-snippet.tsx — Zero hook code viewer with server-side syntax highlighting.
 *
 * Highlights TypeScript/JavaScript keywords using a fast, zero-dependency RegExp tokenizer.
 * Copy feedback is achieved via direct DOM manipulation in the click handler.
 */

type CodeSnippetProps = {
  code: string;
  filename?: string;
  language?: string;
};

function highlightTS(code: string): string {
  // Simple regex tokenizer for typescript keywords, strings, and comments
  const keywords =
    /\b(export|async|function|const|return|await|let|if|else|import|from|typeof|undefined|new|Promise|try|catch|satisfies|as|string|number|boolean|any|let|var|class|interface|type)\b/g;
  const strings = /(["'`])(.*?)\1/g;
  const comments = /(\/\/.*)/g;

  // Escape HTML first to prevent code execution
  let html = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const placeholders: string[] = [];

  // 1. Extract and preserve comments
  html = html.replace(comments, (match) => {
    placeholders.push(`<span class="code-comment">${match}</span>`);
    return `___COMMENT_PLACEHOLDER_${placeholders.length - 1}___`;
  });

  // 2. Extract and preserve strings
  html = html.replace(strings, (match) => {
    placeholders.push(`<span class="code-string">${match}</span>`);
    return `___STRING_PLACEHOLDER_${placeholders.length - 1}___`;
  });

  // 3. Highlight keywords
  html = html.replace(keywords, '<span class="code-keyword">$1</span>');

  // 4. Restore comments and strings in order
  placeholders.forEach((val, i) => {
    html = html.replace(new RegExp(`___(?:COMMENT|STRING)_PLACEHOLDER_${i}___`, "g"), val);
  });

  return html;
}

export function CodeSnippet({ code, filename, language = "typescript" }: CodeSnippetProps) {
  function handleCopy(e: React.MouseEvent<HTMLButtonElement>) {
    void navigator.clipboard.writeText(code);
    const btn = e.currentTarget;
    const original = btn.textContent ?? "Copy";
    btn.textContent = "Copied!";
    btn.style.color = "#10b981";
    btn.style.borderColor = "rgba(16,185,129,0.4)";
    setTimeout(() => {
      btn.textContent = original;
      btn.style.color = "";
      btn.style.borderColor = "";
    }, 2000);
  }

  const highlighted = highlightTS(code);

  return (
    <div className="code-snippet-wrapper">
      <div className="code-snippet-header">
        <span className="code-snippet-filename">
          {/* Terminal dots */}
          <span className="terminal-dot" style={{ background: "#ff5f57" }} />
          <span className="terminal-dot" style={{ background: "#ffbd2e" }} />
          <span className="terminal-dot" style={{ background: "#28ca41" }} />
          <span className="ml-2">{filename ?? `snippet.${language}`}</span>
        </span>
        <button className="code-copy-btn" onClick={handleCopy} type="button">
          Copy
        </button>
      </div>
      <pre className="code-snippet-pre">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}
