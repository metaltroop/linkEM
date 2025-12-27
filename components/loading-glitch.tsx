'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export const LoadingGlitch = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background"
                >
                    <div className="relative">
                        <motion.h1
                            animate={{
                                x: [-2, 2, -2, 2, 0],
                                opacity: [1, 0.8, 1, 0.9, 1],
                                filter: [
                                    'none',
                                    'hue-rotate(90deg) blur(1px)',
                                    'none',
                                    'hue-rotate(-90deg) blur(1px)',
                                    'none',
                                ],
                            }}
                            transition={{
                                duration: 0.2,
                                repeat: Infinity,
                                repeatType: 'mirror',
                            }}
                            className="text-4xl font-black tracking-tighter text-metal-blue"
                        >
                            METALTR<span className="text-metal-yellow">OOP</span>
                        </motion.h1>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            className="absolute -bottom-2 left-0 h-1 bg-metal-yellow"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
