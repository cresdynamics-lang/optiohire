'use client'

import React, { useRef, useState, useCallback, memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LucideIcon, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface GradientCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  benefits: string[];
  index?: number;
}

export const GradientCard = memo(({ icon: Icon, title, description, benefits, index = 0 }: GradientCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Hover state handlers
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative rounded-[32px] overflow-hidden h-full group bg-black",
        "transition-colors duration-500 ease-out"
      )}
      style={{
        border: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 0 20px rgba(255, 255, 255, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05)"
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Gradient Base Layer */}
      <div className="absolute inset-0 z-0">
        {/* Main blue gradient background - lighter top-left to darker bottom-right */}
        <div 
          className="absolute inset-0"
        style={{
            background: "linear-gradient(135deg, rgba(45, 45, 221, 0.4) 0%, rgba(45, 45, 221, 0.3) 50%, rgba(45, 45, 221, 0.15) 100%)"
        }}
      />
        {/* Radial glow at top-left for depth */}
        <div 
          className="absolute inset-0"
        style={{
            background: "radial-gradient(ellipse at top left, rgba(45, 45, 221, 0.5), transparent 60%)"
        }}
      />
        {/* Subtle overlay for more depth */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            background: "radial-gradient(ellipse at bottom right, rgba(0, 0, 0, 0.3), transparent 70%)"
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-8 sm:p-10 flex flex-col h-full">
          {/* Icon */}
        <div className="mb-6 inline-flex">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out shadow-lg">
               <Icon className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-grow">
          <h3 className="text-base sm:text-lg font-semibold font-figtree text-white mb-3">
            {title}
          </h3>
          <p className="text-white text-sm sm:text-base leading-relaxed mb-8 font-figtree font-light opacity-90">
            {description}
          </p>
        </div>

        {/* Benefits List */}
        <div className="mt-auto space-y-3 pt-6">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
              className="flex items-start gap-3"
              initial={{ opacity: 0.8 }}
              whileHover={{ x: 4 }}
              >
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-white font-figtree font-light">
                {benefit}
              </span>
              </motion.div>
            ))}
          </div>
      </div>

    </motion.div>
  );
});

GradientCard.displayName = 'GradientCard';
