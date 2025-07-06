import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Copy button component - no background, no border
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 text-[#e6e6e6] px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 z-10 hover:bg-white/10"
      aria-label="Copy code"
    >
      {copied ? (
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Copied
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy
        </span>
      )}
    </button>
  );
};

// Helper function to clean and unescape code content
const processCodeContent = (text: string): string => {
  return text
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .trim();
};

// Language mapping for better detection
const getLanguageFromClassName = (className: string = ""): string => {
  const match = /language-(\w+)/.exec(className);
  if (!match) return "";

  const lang = match[1].toLowerCase();

  // Map common aliases to proper language names
  const languageMap: { [key: string]: string } = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    py: "python",
    rb: "ruby",
    sh: "bash",
    shell: "bash",
    yml: "yaml",
    md: "markdown",
    html: "markup",
    xml: "markup",
    "c++": "cpp",
    "c#": "csharp",
    cs: "csharp",
    php: "php",
    go: "go",
    rust: "rust",
    swift: "swift",
    kotlin: "kotlin",
    scala: "scala",
    r: "r",
    sql: "sql",
    json: "json",
    css: "css",
    scss: "scss",
    sass: "sass",
    less: "less",
    dockerfile: "docker",
    makefile: "makefile",
    gitignore: "gitignore",
  };

  return languageMap[lang] || lang;
};

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Headings with better spacing and styling
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-[#ececec] mb-4 mt-6 first:mt-0 border-b border-[#404040] pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-[#ececec] mb-3 mt-5 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold text-[#ececec] mb-2 mt-4 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-bold text-[#ececec] mb-2 mt-3 first:mt-0">
              {children}
            </h4>
          ),

          // Paragraphs with better spacing
          p: ({ children }) => (
            <p className="text-[#ececec] mb-4 last:mb-0 leading-7">
              {children}
            </p>
          ),

          // Bold and italic with proper contrast
          strong: ({ children }) => (
            <strong className="font-bold text-[#ffffff]">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[#d4d4d4]">{children}</em>
          ),

          // Enhanced code handling - removed text highlighting
          code: (props) => {
            const { children, className, ...rest } = props;
            const language = getLanguageFromClassName(className);
            const isCodeBlock = Boolean(
              language || (className && className.includes("language-"))
            );

            // Safe children processing
            let codeContent = "";
            try {
              if (typeof children === "string") {
                codeContent = children;
              } else if (Array.isArray(children)) {
                codeContent = children
                  .filter((child) => typeof child === "string")
                  .join("");
              } else if (children) {
                codeContent = String(children);
              }

              codeContent = processCodeContent(codeContent);
            } catch (error) {
              console.warn("Error processing code content:", error);
              codeContent = String(children || "");
            }

            // Multi-line code blocks - removed text highlighting
            if (isCodeBlock) {
              return (
                <div className="my-6 relative group">
                  {/* Language label - same background as code block, no border */}
                  {language && (
                    <div className="absolute top-3 left-4 bg-[#171717] text-[#888] px-2 py-1 rounded text-xs font-mono z-20">
                      {language}
                    </div>
                  )}

                  {/* Copy button - no background, no border */}
                  <CopyButton text={codeContent} />

                  {/* Code block with no text highlighting */}
                  <div className="bg-[#171717] border-0 border-solid rounded-xl overflow-hidden">
                    <SyntaxHighlighter
                      language={language || "text"}
                      style={vscDarkPlus}
                      customStyle={{
                        backgroundColor: "#171717",
                        border: "none",
                        borderRadius: "0.75rem",
                        padding: "16px",
                        paddingTop: language ? "48px" : "16px",
                        fontSize: "14px",
                        lineHeight: "1.6",
                        margin: 0,
                        fontFamily:
                          "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
                      }}
                      wrapLines={true}
                      wrapLongLines={true}
                      showLineNumbers={false}
                      PreTag="div" // Use div instead of pre to avoid text selection issues
                      CodeTag="code" // Use code tag
                      codeTagProps={{
                        style: {
                          WebkitUserSelect: "text", // Allow text selection
                          MozUserSelect: "text",
                          msUserSelect: "text",
                          userSelect: "text",
                          outline: "none", // Remove focus outline
                          background: "transparent", // Remove any background highlights
                        },
                      }}
                    >
                      {codeContent}
                    </SyntaxHighlighter>
                  </div>
                </div>
              );
            }

            // Inline code with background
            return (
              <code
                className="bg-[#404040] text-[#ececec] px-2 py-0.5 rounded text-sm font-mono"
                {...rest}
              >
                {codeContent}
              </code>
            );
          },

          // Enhanced lists with better styling
          ul: ({ children }) => (
            <ul className="list-none text-[#ececec] mb-4 space-y-2 ml-4">
              {React.Children.map(children, (child, index) => (
                <li
                  key={index}
                  className="relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#888] before:font-bold"
                >
                  {child}
                </li>
              ))}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-[#ececec] mb-4 space-y-2 ml-4">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <div className="text-[#ececec] leading-7">{children}</div>
          ),

          // Enhanced blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#4a9eff] bg-[#1a1a1a] pl-4 py-2 italic text-[#d4d4d4] my-4 rounded-r-md">
              {children}
            </blockquote>
          ),

          // Better links
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-[#4a9eff] hover:text-[#6bb3ff] underline decoration-1 underline-offset-2 hover:decoration-2 transition-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          // Enhanced tables
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto">
              <table className="min-w-full border-collapse border border-[#404040] rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#2a2a2a]">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[#404040]">{children}</tbody>
          ),
          th: ({ children }) => (
            <th className="border border-[#404040] px-4 py-3 text-left text-[#ffffff] font-semibold bg-[#333]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[#404040] px-4 py-3 text-[#ececec]">
              {children}
            </td>
          ),

          // Better horizontal rules
          hr: () => <hr className="border-t-2 border-[#404040] my-8 rounded" />,

          // Task lists (GitHub-style checkboxes)
          input: ({ checked, type }) => {
            if (type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mr-2 rounded border-[#404040] bg-[#1a1a1a] text-[#4a9eff] focus:ring-[#4a9eff] focus:ring-2"
                />
              );
            }
            return <input type={type} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
