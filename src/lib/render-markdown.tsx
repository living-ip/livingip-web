import React from "react";

// Minimal server-safe Markdown → React renderer for claim bodies.
// Handles: # / ## / ### headings, paragraphs, **bold**, `inline code`.
// Intentionally narrow — claim bodies in the codex are prose with occasional
// headings and emphasis. A full CommonMark parser (react-markdown + remark-gfm)
// is an easy upgrade if we need lists, tables, links, etc. later.

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Bold: **x**  |  Inline code: `x`
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      nodes.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
    } else {
      nodes.push(
        <code
          key={key++}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.92em",
            background: "var(--surface-2)",
            padding: "1px 6px",
            borderRadius: 3,
          }}
        >
          {tok.slice(1, -1)}
        </code>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function renderMarkdown(body: string): React.ReactNode {
  if (!body) return null;

  // Split on blank lines; each block is either a heading or a paragraph.
  const blocks = body.trim().split(/\n\s*\n+/);

  return blocks.map((rawBlock, i) => {
    const block = rawBlock.trim();
    if (!block) return null;

    // Headings
    const h3 = block.match(/^###\s+(.+)$/m);
    const h2 = block.match(/^##\s+(.+)$/m);
    const h1 = block.match(/^#\s+(.+)$/m);

    if (h3 && block.startsWith("### ")) {
      return <h3 key={i}>{renderInline(h3[1])}</h3>;
    }
    if (h2 && block.startsWith("## ")) {
      return <h2 key={i}>{renderInline(h2[1])}</h2>;
    }
    if (h1 && block.startsWith("# ")) {
      // Skip the document-title H1 — we render the claim title
      // separately in the reader's own <h1 class="reader-title">.
      if (i === 0) return null;
      return <h2 key={i}>{renderInline(h1[1])}</h2>;
    }

    // Paragraph — preserve single-newline line breaks within the block.
    const lines = block.split(/\n/);
    return (
      <p key={i}>
        {lines.map((line, li) => (
          <React.Fragment key={li}>
            {renderInline(line)}
            {li < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    );
  });
}
