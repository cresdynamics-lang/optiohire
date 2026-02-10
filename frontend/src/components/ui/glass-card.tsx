'use client'

import * as React from "react";
import { LucideIcon, CheckCircle } from "lucide-react";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
  benefits: string[];
  index?: number;
}

const GlassCard = React.memo(React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, icon: Icon, title, description, benefits, index = 0, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`group h-auto min-h-[380px] sm:min-h-[450px] w-full max-w-[600px] ${className || ''}`}
        {...props}
      >
        {/* Main card container with WHITE BORDER and BLACK TO BLUE GRADIENT */}
        <div 
          className="relative h-full rounded-[30px] sm:rounded-[50px] p-3 sm:p-6 md:p-8 flex flex-col transition-all duration-500 ease-out cursor-pointer group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-2xl"
          style={{ 
            border: '1px solid #FFFFFF',
            background: 'linear-gradient(135deg, #000000 0%, #0a0a15 30%, #151535 60%, #1e1e50 80%, #2D2DDD 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Additional blue overlay for more visibility */}
          <div 
            className="absolute inset-0 rounded-[30px] sm:rounded-[50px] pointer-events-none transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: 'radial-gradient(ellipse 180% 150% at bottom right, #2D2DDD 0%, rgba(45,45,221,0.8) 25%, rgba(45,45,221,0.4) 50%, transparent 85%)',
              opacity: 0.9
            }}
          ></div>
          
          {/* Hover glow effect */}
          <div 
            className="absolute inset-0 rounded-[30px] sm:rounded-[50px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(45, 45, 221, 0.3) 0%, transparent 70%)',
              filter: 'blur(20px)',
              boxShadow: 'inset 0 0 40px rgba(45, 45, 221, 0.2)'
            }}
          ></div>
          
          {/* Enhanced border glow on hover */}
          <div 
            className="absolute -inset-[1px] rounded-[30px] sm:rounded-[50px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 0 20px rgba(45, 45, 221, 0.4), 0 0 40px rgba(45, 45, 221, 0.2)'
            }}
          ></div>

          {/* Content - relative positioning so it's above the gradient */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Icon */}
            <div className="mb-3 sm:mb-5 md:mb-6 transition-all duration-500 group-hover:-translate-y-1">
              <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-white/10 border border-white/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/15 group-hover:border-white/50 group-hover:shadow-lg group-hover:shadow-blue-500/30">
                <Icon className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white transition-transform duration-300 group-hover:scale-110" />
              </div>
            </div>

            {/* Title */}
            <div className="mb-2 sm:mb-3 md:mb-4 transition-all duration-500 group-hover:-translate-y-0.5">
              <h3 className="text-xs sm:text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight font-figtree transition-colors duration-300">
                {title}
              </h3>
            </div>

            {/* Description */}
            <div className="mb-3 sm:mb-5 md:mb-6 flex-grow transition-all duration-500 group-hover:-translate-y-0.5">
              <p className="text-[10px] sm:text-sm md:text-base text-gray-300 leading-snug sm:leading-relaxed font-figtree font-light transition-colors duration-300 group-hover:text-gray-200 line-clamp-3">
                {description}
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-1 sm:space-y-2">
              {benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-1.5 sm:gap-2"
                >
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-[9px] sm:text-xs md:text-sm text-gray-300 font-light font-figtree leading-tight sm:leading-relaxed line-clamp-1">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
));

GlassCard.displayName = "GlassCard";

export default GlassCard;
