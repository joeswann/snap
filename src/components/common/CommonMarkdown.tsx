import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { DefaultComponentInterface } from "~/types/components";

const CommonMarkdown: DefaultComponentInterface = ({ children: markdown }) => {
  const [copyText, setCopyText] = useState("Copy");

  const handleCopyClick = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopyText("Copied!");
    setTimeout(() => {
      setCopyText("Copy");
    }, 2000);
  };

  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          const code = String(children).replace(/\n$/, "");

          return !inline && match ? (
            <div style={{ position: "relative" }}>
              <SyntaxHighlighter
                style={dracula}
                PreTag="div"
                language={match[1]}
                {...props}
              >
                {code}
              </SyntaxHighlighter>
              <button
                style={{
                  position: "absolute",
                  top: "0.5rem",
                  right: "0.5rem",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.875rem",
                  backgroundColor: "#f1f1f1",
                  border: "none",
                  borderRadius: "0.25rem",
                  cursor: "pointer",
                }}
                onClick={() => handleCopyClick(code)}
              >
                {copyText}
              </button>
            </div>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {markdown}
    </Markdown>
  );
};

export default CommonMarkdown;
