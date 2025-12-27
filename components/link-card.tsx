'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

interface LinkCardProps {
    title: string;
    url: string;
    iconUrl: string | null;
    delay?: number;
}

export const LinkCard = ({ title, url, iconUrl, delay = 0 }: LinkCardProps) => {
    return (
        <motion.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: delay,
            }}
            whileHover={{
                scale: 1.05,
                y: -8,
                boxShadow: "0 30px 60px rgba(0, 163, 255, 0.2)",
                borderColor: "rgba(0, 163, 255, 0.5)",
            }}
            whileTap={{ scale: 0.95, y: -2 }}
            className="group relative flex flex-col items-center justify-center p-6 w-full aspect-square rounded-[32px] border border-white/5 bg-metal-charcoal/40 backdrop-blur-xl transition-all duration-500 hover:bg-metal-blue/[0.05] overflow-hidden text-center"
        >
            {/* Top Shine and Grid Accent */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute inset-0 bg-industrial-grid bg-[length:16px_16px] opacity-[0.05]" />

            <div className="relative z-10 flex flex-col items-center gap-6 w-full">
                {/* Icon Container with Mechanical Border */}
                <div className="relative group-hover:scale-110 transition-transform duration-700">
                    <div className="w-24 h-24 rounded-3xl border border-white/10 bg-black/60 flex items-center justify-center overflow-hidden relative shadow-2xl group-hover:border-metal-blue/40 transition-colors">
                        {iconUrl ? (
                            <Image
                                src={iconUrl}
                                alt={title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                sizes="256px"
                                quality={100}
                                priority
                            />
                        ) : (
                            <ExternalLink className="w-10 h-10 text-white/5" />
                        )}
                    </div>
                    {/* Status indicator ring */}
                    <div className="absolute -inset-2 border border-metal-blue/10 rounded-[36px] animate-[spin_10s_linear_infinite]" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-metal-blue border-4 border-metal-charcoal shadow-[0_0_12px_rgba(0,163,255,0.8)]" />
                </div>

                <div className="space-y-2 w-full">
                    <h3 className="text-xl font-black text-white tracking-tight leading-tight group-hover:text-metal-blue transition-colors uppercase">
                        {title}
                    </h3>
                    <div className="flex flex-col items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-mono font-bold text-metal-blue uppercase tracking-[0.2em]">Live Channel</span>
                        <p className="text-[9px] font-mono text-white/40 truncate w-full px-4 lowercase tracking-tighter">
                            {new URL(url).hostname}
                        </p>
                    </div>
                </div>
            </div>

            {/* Subtle Mechanical Accents */}
            <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-white/10 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-white/10 rounded-bl-lg" />

            {/* Holographic scanner line effect on hover */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-metal-blue/10 to-transparent h-1/4 w-full"
                initial={{ top: '-100%' }}
                whileHover={{ top: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
        </motion.a>
    );
};
