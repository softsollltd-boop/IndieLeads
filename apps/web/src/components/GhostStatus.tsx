
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface GhostStatusProps {
    isVisible: boolean;
}

const GhostStatus: React.FC<GhostStatusProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95, filter: 'blur(10px)' }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                transition: {
                    type: 'spring',
                    damping: 15,
                    stiffness: 100
                }
            }}
            exit={{ opacity: 0, y: -10, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
            <div className="relative group">
                {/* Glowing Background Pulse */}
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-2xl blur-lg"
                />

                <div className="relative bg-slate-900/90 backdrop-blur-md border border-amber-500/30 px-6 py-4 rounded-2xl shadow-2xl flex flex-col gap-2 max-w-md">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute -inset-1 bg-amber-500/10 rounded-full blur-sm"
                            />
                            <AlertTriangle className="w-5 h-5 text-amber-500 relative z-10" />
                        </div>

                        <div className="flex flex-col">
                            <span className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                Ghost Mode Active
                                <motion.span
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                                />
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">DB Synchronizing In Progress</span>
                        </div>

                        <div className="ml-auto">
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <RefreshCw size={14} className="text-slate-500 opacity-50" />
                            </motion.div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

                    <p className="text-[11px] leading-relaxed text-slate-300 font-medium italic">
                        "Created a production-grade React calculator with Lucide icons, Framer Motion animations, and a history drawer."
                    </p>

                    {/* Scanning Line Animation */}
                    <motion.div
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-[1px] bg-amber-500/20 pointer-events-none"
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default GhostStatus;
