'use client';

import { useRef, useState, ReactNode } from 'react';

interface Button2Props {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button2 = ({ 
  children, 
  onClick, 
  href,
  className = '',
  type = 'button'
}: Button2Props) => {
  const divRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!divRef.current || isFocused) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const commonProps = {
    ref: divRef as any,
    onMouseMove: handleMouseMove,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    className: `relative inline-flex w-fit h-12 items-center justify-center overflow-hidden rounded-2xl border-2 dark:border-[#656fe2] border-[#c0c6fc] bg-gradient-to-r dark:from-[#070e41] dark:to-[#141d57] from-[#9ba3fdfd] to-[#3d5af1] px-6 font-medium text-white shadow-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50 font-figtree text-sm font-light tracking-tight ${className}`,
    style: {
      '--opacity': opacity,
    } as React.CSSProperties,
  };

  if (href) {
    return (
      <a
        {...commonProps}
        href={href}
        onClick={handleClick}
      >
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
          style={{
            opacity,
            background: `radial-gradient(100px circle at ${position.x}px ${position.y}px, #656fe288, #00000026)`,
          }}
        />
        <span className="relative z-20">{children}</span>
      </a>
    );
  }

  return (
    <button
      {...commonProps}
      type={type}
      onClick={handleClick}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(100px circle at ${position.x}px ${position.y}px, #656fe288, #00000026)`,
        }}
      />
      <span className="relative z-20">{children}</span>
    </button>
  );
};

