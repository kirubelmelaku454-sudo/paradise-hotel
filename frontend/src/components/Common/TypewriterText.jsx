import React, { useState, useEffect } from 'react';

/**
 * TypewriterText Component
 * Dynamically types out text character-by-character with a blinking luxury cursor.
 * Handles language switching, dynamic unicode/Amharic characters, and clean re-typing.
 */
export default function TypewriterText({
  text = '',
  speed = 65,
  delay = 150,
  cursor = true,
  cursorChar = '|',
  className = '',
  style = {},
  tag: Tag = 'span',
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    let intervalId = null;
    setDisplayedText('');
    setIsTyping(true);

    const chars = Array.from(String(text || ''));
    if (chars.length === 0) {
      setIsTyping(false);
      return;
    }

    const startTimer = setTimeout(() => {
      let currentIndex = 0;

      intervalId = setInterval(() => {
        if (isCancelled) return;
        currentIndex++;
        setDisplayedText(chars.slice(0, currentIndex).join(''));

        if (currentIndex >= chars.length) {
          clearInterval(intervalId);
          setIsTyping(false);
        }
      }, speed);
    }, delay);

    return () => {
      isCancelled = true;
      clearTimeout(startTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, delay]);

  return (
    <Tag className={`typewriter-container ${className}`} style={{ display: 'inline', ...style }}>
      <span className="typewriter-content">{displayedText}</span>
      {cursor && (
        <span
          className={`typewriter-cursor ${isTyping ? 'typing' : 'idle'}`}
          aria-hidden="true"
        >
          {cursorChar}
        </span>
      )}
    </Tag>
  );
}
