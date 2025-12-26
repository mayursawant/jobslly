import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';

export const Ripple = ({ mainCircleSize = 210, mainCircleOpacity = 0.24, numCircles = 8 }) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-visible [mask-image:linear-gradient(to_bottom,white,transparent)]">
            {Array.from({ length: numCircles }).map((_, i) => (
                <div
                    key={i}
                    className="absolute animate-ripple rounded-full bg-blue-500/25 border border-blue-100 shadow-xl"
                    style={{
                        width: mainCircleSize + i * 70,
                        height: mainCircleSize + i * 70,
                        opacity: Math.max(0.05, mainCircleOpacity - i * 0.03),
                        animationDelay: `${i * 0.06}s`,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) scale(1)',
                    }}
                />
            ))}
        </div>
    );
};

export const OrbitIcon = ({
    className,
    duration = 20,
    delay = 0,
    radius = 100,
    children,
    reverse = false
}) => {
    return (
        <div
            className={cn("absolute flex items-center justify-center", className)}
            style={{
                width: '50px',
                height: '50px',
                animation: `orbit ${duration}s linear infinite ${delay}s ${reverse ? 'reverse' : 'normal'}`,
                top: '50%',
                left: '50%',
                '--radius': `${radius}px`,
            }}
        >
            <div
                className="flex items-center justify-center w-full h-full"
                style={{
                    animation: `orbit-counter ${duration}s linear infinite ${delay}s ${reverse ? 'reverse' : 'normal'}`,
                }}
            >
                {children}
            </div>
        </div>
    );
};

export const TechOrbitDisplay = ({ iconsArray, text }) => {
    const containerRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event) => {
            if (!containerRef.current) return;

            const { left, top, width, height } = containerRef.current.getBoundingClientRect();
            const x = (event.clientX - left - width / 2) / 25; // Division controls sensitivity
            const y = (event.clientY - top - height / 2) / 25;

            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative flex h-[500px] w-full max-w-[500px] items-center justify-center overflow-hidden rounded-lg bg-background p-20 md:shadow-xl transition-transform duration-200 ease-out"
        >
            {/* Central Graphic - Custom Generated Asset with Parallax */}
            <div
                className="z-10 flex items-center justify-center p-6 bg-white rounded-full shadow-2xl shadow-blue-200/50 animate-pulse-slow border border-blue-50"
                style={{
                    transform: `translate(${mousePosition.x * -1.5}px, ${mousePosition.y * -1.5}px)`
                }}
            >
                <img
                    src="/healthcare-pulse.png"
                    alt="Healthcare Technology"
                    className="w-32 h-32 object-contain"
                />
            </div>

            {/* Orbiting Icons with slight parallax */}
            <div style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}>
                {iconsArray.map((icon, index) => (
                    <OrbitIcon
                        key={index}
                        className={icon.className}
                        duration={icon.duration}
                        delay={icon.delay}
                        radius={icon.radius}
                        reverse={icon.reverse}
                    >
                        {icon.component()}
                    </OrbitIcon>
                ))}
            </div>

            <style jsx>{`
        @keyframes orbit {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(var(--radius)) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) translateX(var(--radius)) rotate(-360deg);
          }
        }
        @keyframes orbit-counter {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
        }
        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(0.8); }
          50% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(0.8); }
        }
        .animate-ripple {
            animation: ripple 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
            animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
        </div>
    );
};

export const iconsArray = [
    {
        component: () => (
            <div className="bg-white p-3 rounded-2xl shadow-lg border border-teal-100/50 backdrop-blur-sm">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            </div>
        ),
        className: 'size-[60px] border-none bg-transparent',
        duration: 35,
        delay: 0,
        radius: 130,
        path: true,
    },
    {
        component: () => (
            <div className="bg-white p-3 rounded-2xl shadow-lg border border-blue-100/50 backdrop-blur-sm">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        ),
        className: 'size-[50px] border-none bg-transparent',
        duration: 30,
        delay: 10,
        radius: 190,
        path: true,
        reverse: true,
    },
    {
        component: () => (
            <div className="bg-white p-3 rounded-2xl shadow-lg border border-emerald-100/50 backdrop-blur-sm">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        ),
        className: 'size-[50px] border-none bg-transparent',
        radius: 250,
        duration: 40,
        path: true,
    },
    {
        component: () => (
            <div className="bg-white p-3 rounded-2xl shadow-lg border border-cyan-100/50 backdrop-blur-sm">
                <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            </div>
        ),
        className: 'size-[55px] border-none bg-transparent',
        radius: 310,
        duration: 45,
        delay: 15,
        path: true,
        reverse: true,
    },
    {
        component: () => (
            <div className="bg-white p-3 rounded-2xl shadow-lg border border-purple-100/50 backdrop-blur-sm">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
            </div>
        ),
        className: 'size-[50px] border-none bg-transparent',
        duration: 35,
        delay: 20,
        radius: 160,
        path: true,
    },
    {
        component: () => (
            <div className="bg-white p-2 rounded-xl shadow-md border border-orange-100/50 backdrop-blur-sm">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        ),
        className: 'size-[40px] border-none bg-transparent',
        duration: 25,
        delay: 5,
        radius: 100,
        path: true,
        reverse: true,
    }
];
