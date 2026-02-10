'use client'

import React, { useRef, useEffect, useState } from 'react';
import { RippleButton } from "@/components/ui/multi-type-ripple-buttons";

// --- Internal Helper Components --- //

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16" height="16"
    viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="3"
    strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ShaderCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const glProgramRef = useRef<WebGLProgram | null>(null);
  const glBgColorLocationRef = useRef<WebGLUniformLocation | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [backgroundColor, setBackgroundColor] = useState([0.0, 0.0, 0.0]);

  useEffect(() => {
    const root = document.documentElement;
    const updateColor = () => {
      const isDark = root.classList.contains('dark');
      setBackgroundColor(isDark ? [0, 0, 0] : [0, 0, 0]);
    };
    updateColor();
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateColor();
        }
      }
    });
    observer.observe(root, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    const program = glProgramRef.current;
    const location = glBgColorLocationRef.current;
    if (gl && program && location) {
      gl.useProgram(program);
      gl.uniform3fv(location, new Float32Array(backgroundColor));
    }
  }, [backgroundColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const gl = canvas.getContext('webgl');
    if (!gl) { console.error("WebGL not supported"); return; }
    glRef.current = gl;

    const vertexShaderSource = `attribute vec2 aPosition; void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`;
    const fragmentShaderSource = `
      precision highp float;
      uniform float iTime;
      uniform vec2 iResolution;
      uniform vec3 uBackgroundColor;
      mat2 rotate2d(float angle){ float c=cos(angle),s=sin(angle); return mat2(c,-s,s,c); }
      float variation(vec2 v1,vec2 v2,float strength,float speed){ return sin(dot(normalize(v1),normalize(v2))*strength+iTime*speed)/100.0; }
      vec3 paintCircle(vec2 uv,vec2 center,float rad,float width){
        vec2 diff = center-uv;
        float len = length(diff);
        len += variation(diff,vec2(0.,1.),5.,2.);
        len -= variation(diff,vec2(1.,0.),5.,2.);
        float circle = smoothstep(rad-width,rad,len)-smoothstep(rad,rad+width,len);
        return vec3(circle);
      }
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }
      void main(){
        vec2 uv = gl_FragCoord.xy/iResolution.xy;
        uv.x *= 1.5; uv.x -= 0.25;
        float mask = 0.0;
        float radius = .35;
        vec2 center = vec2(.5);
        mask += paintCircle(uv,center,radius,.035).r;
        mask += paintCircle(uv,center,radius-.018,.01).r;
        mask += paintCircle(uv,center,radius+.018,.005).r;
        vec2 rotated = rotate2d(iTime*0.3)*(uv-center);
        float angle = atan(rotated.y, rotated.x);
        float hue = (angle + 3.14159) / (2.0 * 3.14159) + iTime * 0.15;
        hue = fract(hue);
        float saturation = 0.85 + 0.15 * sin(iTime * 0.5);
        float brightness = 0.9 + 0.1 * cos(iTime * 0.7);
        vec3 foregroundColor = hsv2rgb(vec3(hue, saturation, brightness));
        vec3 color=mix(uBackgroundColor,foregroundColor,mask);
        color=mix(color,vec3(1.),paintCircle(uv,center,radius,.003).r);
        gl_FragColor=vec4(color,1.);
      }`;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Could not create shader");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation error");
      }
      return shader;
    };

    const program = gl.createProgram();
    if (!program) throw new Error("Could not create program");
    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    glProgramRef.current = program;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const iTimeLoc = gl.getUniformLocation(program, 'iTime');
    const iResLoc = gl.getUniformLocation(program, 'iResolution');
    glBgColorLocationRef.current = gl.getUniformLocation(program, 'uBackgroundColor');
    
    // Set initial background color
    gl.uniform3fv(glBgColorLocationRef.current, new Float32Array([0, 0, 0]));

    // Initial canvas size
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    gl.viewport(0, 0, rect.width, rect.height);
    gl.uniform2f(iResLoc, canvas.width, canvas.height);

    // Initialize start time
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }
    
    const render = (timestamp: DOMHighResTimeStamp) => {
      // Always schedule next frame first to ensure continuous animation
      animationFrameRef.current = requestAnimationFrame(render);
      
      const currentContainer = containerRef.current;
      const currentCanvas = canvasRef.current;
      const currentGl = glRef.current;
      
      if (!currentContainer || !currentCanvas || !currentGl || !startTimeRef.current) {
        return;
      }
      
      // Only resize if dimensions actually changed
      const currentRect = currentContainer.getBoundingClientRect();
      if (currentCanvas.width !== currentRect.width || currentCanvas.height !== currentRect.height) {
        currentCanvas.width = currentRect.width;
        currentCanvas.height = currentRect.height;
        currentGl.viewport(0, 0, currentCanvas.width, currentCanvas.height);
        currentGl.uniform2f(iResLoc, currentCanvas.width, currentCanvas.height);
      }
      
      // Calculate continuous elapsed time from start
      // Use performance.now() for consistent timing
      const currentTime = performance.now();
      const elapsedTime = currentTime - startTimeRef.current;
      
      // Use elapsed time for smooth continuous animation
      currentGl.uniform1f(iTimeLoc, elapsedTime * 0.001);
      currentGl.drawArrays(currentGl.TRIANGLES, 0, 6);
    };
    
    const handleResize = () => {
      const currentContainer = containerRef.current;
      if (!currentContainer || !canvas || !gl) return;
      const rect = currentContainer.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      gl.viewport(0, 0, rect.width, rect.height);
      gl.uniform2f(iResLoc, canvas.width, canvas.height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(render);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []); // Remove backgroundColor dependency to prevent animation restart

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
};

// --- EXPORTED Building Blocks --- //

export interface PricingCardProps {
  planName: string;
  description: string;
  price: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  buttonVariant?: 'primary' | 'secondary';
  onButtonClick?: () => void;
}

export const PricingCard = ({
  planName, description, price, features, buttonText, isPopular = false, buttonVariant = 'primary', onButtonClick
}: PricingCardProps) => {
  const cardClasses = `
    backdrop-blur-[14px] bg-gradient-to-br rounded-2xl shadow-xl flex-1 max-w-xs px-7 py-8 flex flex-col transition-all duration-300
    from-black/5 to-black/0 border border-white/10
    dark:from-white/10 dark:to-white/5 dark:border-white/10 dark:backdrop-brightness-[0.91]
    ${isPopular ? 'scale-105 relative ring-2 ring-[#4A0DBA]/30 dark:from-white/20 dark:to-white/10 dark:border-[#4A0DBA]/30 shadow-2xl' : ''}
  `;
  const buttonClasses = `
    mt-auto w-full py-2.5 rounded-xl font-semibold text-[14px] transition font-figtree
    ${buttonVariant === 'primary' 
      ? 'bg-[#4A0DBA] hover:bg-[#4A0DBA]/90 text-white' 
      : 'bg-black/10 hover:bg-black/20 text-white border border-white/20 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/20'
    }
  `;

  return (
    <div className={cardClasses.trim()}>
      {isPopular && (
        <div className="absolute -top-4 right-4 px-3 py-1 text-[12px] font-semibold rounded-full bg-[#4A0DBA] text-white font-figtree">
          Most Popular
        </div>
      )}
      <div className="mb-3">
        <h2 className="text-[48px] font-extralight tracking-[-0.03em] text-white font-figtree">{planName}</h2>
        <p className="text-[16px] text-white/70 mt-1 font-figtree font-light">{description}</p>
      </div>
      <div className="my-6 flex items-baseline gap-2">
        <span className="text-[48px] font-extralight text-white font-figtree">${price}</span>
        <span className="text-[14px] text-white/70 font-figtree font-light">/mo</span>
      </div>
      <div className="card-divider w-full mb-5 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1)_50%,transparent)]"></div>
      <ul className="flex flex-col gap-2 text-[14px] text-white/90 mb-6 font-figtree font-light">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <CheckIcon className="text-[#4A0DBA] w-4 h-4 flex-shrink-0" /> 
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <RippleButton 
        className={buttonClasses.trim()}
        onClick={onButtonClick}
        variant="default"
      >
        {buttonText}
      </RippleButton>
    </div>
  );
};

// --- EXPORTED Customizable Page Component --- //

interface ModernPricingPageProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  plans: PricingCardProps[];
  showAnimatedBackground?: boolean;
}

export const ModernPricingPage = ({
  title,
  subtitle,
  plans,
  showAnimatedBackground = false,
}: ModernPricingPageProps) => {
  return (
    <div className="bg-black text-white w-full overflow-x-hidden relative py-24">
      {showAnimatedBackground && <ShaderCanvas />}
      <main className="relative w-full flex flex-col items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-5xl mx-auto text-center mb-14">
          <h1 className="text-[48px] md:text-[64px] font-extralight leading-tight tracking-[-0.03em] bg-clip-text text-transparent bg-gradient-to-r from-white via-[#4A0DBA] to-[#4A0DBA] font-figtree">
            {title}
          </h1>
          <p className="mt-3 text-[16px] md:text-[20px] text-white/80 max-w-2xl mx-auto font-figtree font-light">
            {subtitle}
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 md:gap-6 justify-center items-center w-full max-w-4xl">
          {plans.map((plan) => <PricingCard key={plan.planName} {...plan} />)}
        </div>
      </main>
    </div>
  );
};

