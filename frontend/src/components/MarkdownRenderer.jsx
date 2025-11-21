// OPTIONAL: Enhanced Markdown Renderer with Syntax Highlighting
// Install dependencies first: npm install react-syntax-highlighter

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Enhanced Markdown Renderer Component
const MarkdownRenderer = ({ content, description }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      {description && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-gray-700">{description}</p>
        </div>
      )}
      
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // ========== HEADINGS ==========
            h1: ({ children }) => (
              <h1 className="text-4xl font-bold text-gray-900 mb-6 mt-8 pb-2 border-b-2 border-blue-500">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-3xl font-semibold text-gray-900 mb-4 mt-8 pb-2 border-b border-gray-300">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-xl font-semibold text-gray-800 mb-2 mt-4">
                {children}
              </h4>
            ),

            // ========== PARAGRAPHS ==========
            p: ({ children }) => (
              <p className="text-gray-700 mb-4 leading-relaxed text-base">
                {children}
              </p>
            ),
            
            strong: ({ children }) => (
              <strong className="font-bold text-gray-900">{children}</strong>
            ),
            
            em: ({ children }) => (
              <em className="italic text-gray-700">{children}</em>
            ),

            // ========== BLOCKQUOTES ==========
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-6 italic text-gray-600 bg-blue-50 rounded-r">
                {children}
              </blockquote>
            ),

            // ========== LINKS WITH SECURITY ==========
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline decoration-2 transition-colors font-medium inline-flex items-center gap-1"
              >
                {children}
                <svg 
                  className="inline-block w-3 h-3" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                  />
                </svg>
              </a>
            ),

            // ========== LISTS ==========
            ul: ({ children }) => (
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                {children}
              </ul>
            ),
            
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-700">
                {children}
              </ol>
            ),
            
            li: ({ children }) => (
              <li className="text-gray-700 leading-relaxed">{children}</li>
            ),

            // ========== CODE BLOCKS WITH SYNTAX HIGHLIGHTING ==========
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              const codeString = String(children).replace(/\n$/, '');
              
              return inline ? (
                <code 
                  className="bg-gray-100 text-red-600 px-2 py-0.5 rounded text-sm font-mono border border-gray-300"
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <div className="relative mb-6 rounded-lg overflow-hidden shadow-lg">
                  {/* Language Badge */}
                  {language && (
                    <div className="bg-gray-700 text-gray-300 px-4 py-2 text-xs font-mono uppercase tracking-wide flex items-center justify-between">
                      <span>{language}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(codeString);
                          // You can add a toast notification here
                        }}
                        className="text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-600"
                        title="Copy code"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  {/* Syntax Highlighted Code */}
                  <SyntaxHighlighter
                    language={language || 'text'}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      borderRadius: language ? '0 0 0.5rem 0.5rem' : '0.5rem',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                    }}
                    showLineNumbers={codeString.split('\n').length > 5}
                    wrapLines={true}
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            },

            // ========== HORIZONTAL RULE ==========
            hr: () => (
              <div className="relative my-8">
                <hr className="border-t-2 border-gray-300" />
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-gray-400">
                  •••
                </span>
              </div>
            ),

            // ========== TABLES ==========
            table: ({ children }) => (
              <div className="overflow-x-auto my-6 rounded-lg border border-gray-300 shadow-sm">
                <table className="min-w-full divide-y divide-gray-300">
                  {children}
                </table>
              </div>
            ),
            
            thead: ({ children }) => (
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                {children}
              </thead>
            ),
            
            tbody: ({ children }) => (
              <tbody className="bg-white divide-y divide-gray-200">
                {children}
              </tbody>
            ),
            
            tr: ({ children }) => (
              <tr className="hover:bg-gray-50 transition-colors">
                {children}
              </tr>
            ),
            
            th: ({ children }) => (
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                {children}
              </th>
            ),
            
            td: ({ children }) => (
              <td className="px-6 py-4 text-sm text-gray-700">
                {children}
              </td>
            ),

            // ========== IMAGES ==========
            img: ({ src, alt }) => (
              <figure className="my-6">
                <img
                  src={src}
                  alt={alt || ''}
                  className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                  }}
                />
                {alt && (
                  <figcaption className="text-sm text-gray-500 text-center mt-3 italic">
                    {alt}
                  </figcaption>
                )}
              </figure>
            ),

            // ========== TASK LISTS ==========
            input: ({ checked, ...props }) => (
              <input
                type="checkbox"
                checked={checked}
                disabled
                className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500 cursor-not-allowed"
                {...props}
              />
            ),

            // ========== STRIKETHROUGH ==========
            del: ({ children }) => (
              <del className="text-gray-500 line-through decoration-2">
                {children}
              </del>
            ),
          }}
        >
          {content || "No markdown content available."}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownRenderer;

// ========================================
// USAGE IN RESOURCEDETAIL.JSX:
// ========================================
/*
import MarkdownRenderer from '../components/MarkdownRenderer';

case "markdown":
  return (
    <MarkdownRenderer 
      content={item.content.text}
      description={item.content.description}
    />
  );
*/

// ========================================
// SUPPORTED LANGUAGES FOR SYNTAX HIGHLIGHTING:
// ========================================
/*
- javascript/jsx
- typescript/tsx
- python
- java
- c/cpp
- csharp
- php
- ruby
- go
- rust
- swift
- kotlin
- sql
- html
- css
- scss
- json
- yaml
- markdown
- bash/shell
- powershell
- and many more...

Example markdown with code:
```javascript
function hello() {
  console.log("Hello World!");
}
```
*/