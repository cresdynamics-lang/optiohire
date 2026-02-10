"use client";
import React, { useRef, useEffect, useState, memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextHoverEffect = memo(({
  text,
  duration = 0,
  className,
}: {
  text: string;
  duration?: number;
  automatic?: boolean;
  className?: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null && !shouldReduceMotion) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
      
      // Update gradient directly for smooth animation
      const gradient = svgRef.current.querySelector('#revealMask') as SVGElement;
      if (gradient) {
        gradient.setAttribute('cx', `${cxPercentage}%`);
        gradient.setAttribute('cy', `${cyPercentage}%`);
      }
    }
  }, [cursor, shouldReduceMotion]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (shouldReduceMotion) return;
    setCursor({ x: e.clientX, y: e.clientY });
  };

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      className={cn("select-none uppercase cursor-pointer", className)}
    >
      <defs>
        <linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#eab308" stopOpacity={hovered ? 1 : 0} />
          <stop offset="25%" stopColor="#ef4444" stopOpacity={hovered ? 1 : 0} />
          <stop offset="50%" stopColor="#80eeb4" stopOpacity={hovered ? 1 : 0} />
          <stop offset="75%" stopColor="#06b6d4" stopOpacity={hovered ? 1 : 0} />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={hovered ? 1 : 0} />
        </linearGradient>

        <radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="20%"
          cx={maskPosition.cx}
          cy={maskPosition.cy}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <mask id="textMask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMask)"
          />
        </mask>
      </defs>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-neutral-200 font-figtree text-7xl font-bold dark:stroke-neutral-800"
        style={{ opacity: hovered ? 0.7 : 0 }}
      >
        {text}
      </text>
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.5"
        className="fill-transparent stroke-[#3ca2fa] font-figtree text-7xl font-bold"
        style={{ opacity: hovered ? 0.3 : 1 }}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        transition={{
          duration: shouldReduceMotion ? 0 : 4,
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.text>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="0.5"
        mask="url(#textMask)"
        className="fill-transparent font-figtree text-7xl font-bold"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        {text}
      </text>
    </svg>
  );
});
TextHoverEffect.displayName = "TextHoverEffect";

export const FooterBackgroundGradient = memo(() => {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        background:
          "radial-gradient(125% 125% at 50% 10%, #0F0F1166 50%, #3ca2fa33 100%)",
      }}
    />
  );
});
FooterBackgroundGradient.displayName = "FooterBackgroundGradient";
