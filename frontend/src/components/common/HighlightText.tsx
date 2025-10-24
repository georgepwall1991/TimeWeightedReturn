import React from 'react';

interface HighlightTextProps {
  text: string;
  highlight: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * Component that highlights matching text within a string
 * Case-insensitive matching
 */
export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  highlight,
  className = '',
  highlightClassName = 'bg-yellow-200 font-semibold text-gray-900',
}) => {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  try {
    const regex = new RegExp(`(${escapeRegExp(highlight)})`, 'gi');
    const parts = text.split(regex);

    return (
      <span className={className}>
        {parts.map((part, index) => {
          const isMatch = part.toLowerCase() === highlight.toLowerCase();
          return isMatch ? (
            <mark key={index} className={highlightClassName}>
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          );
        })}
      </span>
    );
  } catch (error) {
    // If regex fails, return original text
    return <span className={className}>{text}</span>;
  }
};

export default HighlightText;
