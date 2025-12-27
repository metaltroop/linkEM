'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { IndustrialGrid } from '@/components/industrial-grid';
import { LoadingGlitch } from '@/components/loading-glitch';
import { LinkCard } from '@/components/link-card';
import { PinPad } from '@/components/pin-pad';
import { Boxes } from 'lucide-react';

interface Link {
    id: number;
    title: string;
    url: string;
    icon_url: string | null;
    order_index: number;
}

export default function HomeClient({ initialLinks }: { initialLinks: Link[] }) {
    const [links] = useState(initialLinks);
    const [isPinPadOpen, setIsPinPadOpen] = useState(false);
    const clickCount = useRef(0);
    const lastClickTime = useRef(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'l' && !isPinPadOpen) {
                setIsPinPadOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPinPadOpen]);

    const handleHeaderClick = () => {
        const now = Date.now();
        if (now - lastClickTime.current < 500) {
            clickCount.current += 1;
        } else {
            clickCount.current = 1;
        }
        lastClickTime.current = now;

        if (clickCount.current === 3) {
            setIsPinPadOpen(true);
            clickCount.current = 0;
        }
    };

    return (
        <main className="relative min-h-screen py-20 px-4 overflow-x-hidden">
            <LoadingGlitch />
            <IndustrialGrid />

            <div className="max-w-4xl mx-auto flex flex-col items-center">
                {/* Header Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-20 cursor-pointer group"
                    onClick={handleHeaderClick}
                >
                    <div className="relative inline-flex items-center justify-center p-6 mb-8 rounded-3xl bg-metal-blue/5 border border-white/5 group-hover:border-metal-blue/50 group-hover:bg-metal-blue/10 transition-all duration-700">
                        <Boxes className="w-16 h-16 text-metal-blue" />
                        <div className="absolute inset-0 border border-metal-blue/20 rounded-3xl animate-[pulse_4s_infinite]" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-metal-yellow rounded-full border-4 border-metal-charcoal shadow-lg shadow-metal-yellow/20" />
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4 group-hover:tracking-normal transition-all duration-500">
                        Link<span className="text-metal-yellow">EM</span>
                    </h1>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/20" />
                        <p className="text-white/40 font-mono text-xs tracking-[0.4em] uppercase">
                            Links of my projects 
                        </p>
                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/20" />
                    </div>
                </motion.div>

                {/* Main Control Panel (Links Grid) */}
                <div className="w-full relative">
                    <div className="absolute -inset-10 bg-metal-blue/5 blur-[120px] rounded-full pointer-events-none" />

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 w-full relative z-10">
                        {links.length > 0 ? (
                            links.map((link, index) => (
                                <LinkCard
                                    key={link.id}
                                    title={link.title}
                                    url={link.url}
                                    iconUrl={link.icon_url}
                                    delay={index * 0.05}
                                />
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full text-center py-24 border border-dashed border-white/5 rounded-[40px] bg-white/[0.02]"
                            >
                                <p className="text-white/10 font-mono text-xs uppercase tracking-[0.5em] animate-pulse">
                                    [ Waiting for transmission streams... ]
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Footer Status Bar */}
                <motion.footer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-24 pt-8 border-t border-white/5 w-full max-w-sm text-center"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-1 h-1 rounded-full bg-metal-blue" />
                        <div className="w-1 h-1 rounded-full bg-metal-blue opacity-50" />
                        <div className="w-1 h-1 rounded-full bg-metal-blue opacity-20" />
                    </div>
                    <p className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-mono leading-relaxed">
                        &copy; 2025 MetalTroop Industries<br />
                        <span className="opacity-50 text-metal-blue">Secured by Encryption-X // Authorized Core v4</span>
                    </p>
                </motion.footer>
            </div>

            <PinPad isOpen={isPinPadOpen} onClose={() => setIsPinPadOpen(false)} />
        </main>
    );
}
