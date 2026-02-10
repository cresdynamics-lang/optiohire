import React from "react";
import { ArrowRight } from "lucide-react";

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  showArrow?: boolean;
  gradientLight?: { from: string; via: string; to: string };
  gradientDark?: { from: string; via: string; to: string };
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  href,
  onClick,
  showArrow = true,
  gradientLight = { from: "from-indigo-500/40", via: "via-indigo-400/40", to: "to-indigo-500/60" },
  gradientDark = { from: "from-indigo-800/30", via: "via-black/50", to: "to-black/70" },
  className = "",
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const baseClasses = `group relative overflow-hidden border-2 cursor-pointer transition-all duration-500 ease-out 
    shadow-2xl hover:shadow-indigo-500/30 hover:scale-[1.02] hover:-translate-y-1 active:scale-95
    h-10 px-6 rounded-[14px]
    border-indigo-500/40 bg-gradient-to-br from-indigo-500/40 via-indigo-400/40 to-indigo-500/60
    flex items-center justify-center gap-2
    ${className}`;

  const content = (
    <>
      {/* Moving gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-300/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-[14px]"></div>

      {/* Overlay glow */}
      <div className="absolute inset-0 rounded-[14px] bg-gradient-to-r from-indigo-400/20 via-indigo-300/10 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Content */}
      <span className="relative z-10 text-white font-medium text-sm font-figtree drop-shadow-sm">
        {children}
      </span>
      {showArrow && (
        <ArrowRight className="relative z-10 w-4 h-4 text-white transition-transform group-hover:translate-x-1 drop-shadow-sm" />
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        onClick={handleClick}
        className={baseClasses}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={baseClasses}
      {...props}
    >
      {content}
    </button>
  );
};

