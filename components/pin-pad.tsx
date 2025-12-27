'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Delete, X } from 'lucide-react';
import { verifyPin } from '@/app/actions';
import { useRouter } from 'next/navigation';

export const PinPad = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    const handleNumberClick = useCallback((num: string) => {
        setPin(prev => {
            if (prev.length < 6) {
                setError('');
                return prev + num;
            }
            return prev;
        });
    }, []);

    const handleDelete = useCallback(() => {
        setPin(prev => prev.slice(0, -1));
    }, []);

    const handleVerify = useCallback(async (currentPin: string) => {
        setIsVerifying(true);
        const result = await verifyPin(currentPin);
        if (result.success) {
            setIsAuthorized(true);
            // Artificial delay for the cool animation
            setTimeout(() => {
                router.push('/admin');
            }, 2000);
        } else {
            setError('ACCESS DENIED');
            setPin('');
            setIsVerifying(false);
        }
    }, [router]);

    useEffect(() => {
        if (pin.length === 6) {
            handleVerify(pin);
        }
    }, [pin, handleVerify]);

    useEffect(() => {
        if (!isOpen || isAuthorized) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (isVerifying) return;

            if (e.key >= '0' && e.key <= '9') {
                handleNumberClick(e.key);
            } else if (e.key === 'Backspace') {
                handleDelete();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isVerifying, isAuthorized, handleNumberClick, handleDelete, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-2xl"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="relative w-full max-w-sm p-10 border border-white/10 bg-black/80 rounded-[40px] shadow-2xl overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-industrial-grid bg-[length:20px_20px] opacity-[0.03] pointer-events-none" />

                    <AnimatePresence mode="wait">
                        {!isAuthorized ? (
                            <motion.div
                                key="keypad"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="relative z-10"
                            >
                                <button
                                    onClick={onClose}
                                    className="absolute -top-4 -right-4 p-2 text-white/20 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex flex-col items-center mb-10">
                                    <motion.div
                                        animate={isVerifying ? { scale: [1, 1.1, 1], opacity: [1, 0.5, 1] } : {}}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="w-20 h-20 bg-metal-blue/5 rounded-3xl flex items-center justify-center mb-6 border border-metal-blue/20 shadow-lg shadow-metal-blue/5"
                                    >
                                        <Shield className="w-10 h-10 text-metal-blue" />
                                    </motion.div>
                                    <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Cryptographic Key</h2>
                                    <p className="text-[10px] font-mono text-metal-blue/40 tracking-[0.3em] uppercase mt-1">Personnel Verification Required</p>

                                    <div className="h-8 mt-6">
                                        {error ? (
                                            <span className="text-red-500 text-xs font-mono font-bold tracking-widest animate-pulse">!! {error} !!</span>
                                        ) : (
                                            <div className="flex gap-3">
                                                {[...Array(6)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={pin.length === i ? { scale: [1, 1.2, 1], borderColor: ['rgba(255,255,255,0.1)', '#00A3FF', 'rgba(255,255,255,0.1)'] } : {}}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                        className={`w-4 h-4 rounded-md border ${pin.length > i ? 'bg-metal-blue border-metal-blue shadow-[0_0_10px_rgba(0,163,255,0.5)]' : 'border-white/10'
                                                            } transition-all duration-300`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => handleNumberClick(num.toString())}
                                            disabled={isVerifying}
                                            className="w-full aspect-square text-2xl font-black rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-metal-blue/30 active:scale-90 transition-all flex items-center justify-center text-white"
                                        >
                                            {num}
                                        </button>
                                    ))}
                                    <div />
                                    <button
                                        onClick={() => handleNumberClick('0')}
                                        disabled={isVerifying}
                                        className="w-full aspect-square text-2xl font-black rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-metal-blue/30 active:scale-90 transition-all flex items-center justify-center text-white"
                                    >
                                        0
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isVerifying}
                                        className="w-full aspect-square rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/30 active:scale-90 transition-all flex items-center justify-center text-white/40 hover:text-red-500"
                                    >
                                        <Delete className="w-6 h-6" />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-10"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="w-24 h-24 bg-green-500/10 border border-green-500/50 rounded-full flex items-center justify-center mb-8 relative"
                                >
                                    <Shield className="w-12 h-12 text-green-500" />
                                    <motion.div
                                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full bg-green-500"
                                    />
                                </motion.div>

                                <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Access Granted</h2>
                                <p className="text-xs font-mono text-green-500/60 uppercase tracking-[0.2em] mb-10 text-center">
                                    Initiating Command Handshake...
                                </p>

                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1.8, ease: "easeInOut" }}
                                        className="h-full bg-metal-blue shadow-[0_0_15px_rgba(0,163,255,0.8)]"
                                    />
                                </div>
                                <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest mt-4">Deploying Admin Console v4.2.0</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
