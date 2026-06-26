"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Copy, Check } from "lucide-react";

type MarkdownRendererProps = {
  content: string;
  showCursor?: boolean;
};

// Code block with language label + copy-to-clipboard button.
function CodeBlock({ className, children }: { className?: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  // rehype-highlight sets className like "hljs language-ts"; extract the language.
  const lang = /language-(\w+)/.exec(className || "")?.[1] || "";

  const handleCopy = () => {
    // Pull the raw text out of the rendered code node.
    const text = extractText(children);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#0c0c0c] border border-b-0 border-[#27272a] rounded-t-xl">
        <span className="text-[11px] text-[#71717a] font-mono uppercase tracking-wider">{lang || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="bg-[#111] p-4 rounded-b-xl border border-[#27272a] overflow-x-auto font-mono text-[13px] text-[#e4e4e7] leading-relaxed select-text">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

// Recursively collect text from React children (for copy).
function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    return extractText((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}

const components: Components = {
  h1: ({ children }) => <h1 className="text-2xl font-semibold text-white mt-4 mb-2 tracking-tight">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl font-semibold text-white mt-4 mb-2 tracking-tight">{children}</h2>,
  h3: ({ children }) => <h3 className="text-lg font-semibold text-white mt-3 mb-1 tracking-tight">{children}</h3>,
  h4: ({ children }) => <h4 className="text-base font-semibold text-white mt-2 mb-1 tracking-tight">{children}</h4>,
  h5: ({ children }) => <h5 className="text-sm font-semibold text-white mt-2 mb-1 tracking-tight">{children}</h5>,
  h6: ({ children }) => <h6 className="text-sm font-semibold text-[#d4d4d8] mt-2 mb-1 tracking-tight">{children}</h6>,
  p: ({ children }) => <p className="leading-relaxed my-2">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="line-through text-[#a1a1aa]">{children}</del>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-orange-400 underline underline-offset-2 hover:text-orange-300 transition-colors break-words"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="list-disc pl-5 my-2 flex flex-col gap-1.5 leading-relaxed marker:text-[#71717a]">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 my-2 flex flex-col gap-1.5 leading-relaxed marker:text-[#71717a]">{children}</ol>,
  li: ({ children }) => <li className="text-[#e4e4e7]">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-orange-400/70 pl-4 py-1 my-2 text-[#a1a1aa] italic leading-relaxed">{children}</blockquote>
  ),
  hr: () => <hr className="my-5 border-0 border-t border-[#27272a]" />,
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-[#27272a]">
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-[#1e1e1e]">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-[#27272a] last:border-0">{children}</tr>,
  th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-white border-r border-[#27272a] last:border-0">{children}</th>,
  td: ({ children }) => <td className="px-3 py-2 text-[#e4e4e7] border-r border-[#27272a] last:border-0 align-top">{children}</td>,
  code: ({ className, children, ...props }) => {
    // react-markdown passes inline code without a language className; block code
    // (inside <pre>) carries a "language-*" / hljs className from rehype-highlight.
    const isBlock = /language-/.test(className || "");
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="bg-[#2e2e33] text-orange-300 px-1 py-0.5 rounded font-mono text-[13px]" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => {
    // The child is the <code> element; render our CodeBlock wrapper around it.
    const codeEl = React.Children.toArray(children).find(
      (c): c is React.ReactElement<{ className?: string; children?: React.ReactNode }> =>
        React.isValidElement(c)
    );
    return (
      <CodeBlock className={codeEl?.props.className}>{codeEl?.props.children}</CodeBlock>
    );
  },
};

export default function MarkdownRenderer({ content, showCursor = false }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className="markdown-body flex flex-col">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
      {showCursor && (
        <span className="inline-block w-1.5 h-4 bg-orange-400 align-middle animate-pulse rounded-sm" />
      )}
    </div>
  );
}
