import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import React from "react";

interface Props {
    setValidationError: (arg: string | null) => void;
    validationError: string | null;
}

export const ValidationErrorModal = ({
    setValidationError,
    validationError,
}: Props) => {
    return (
        <AnimatePresence>
            { validationError &&
                <div className="fixed inset-0 flex items-center justify-center z-[110] p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setValidationError(null)}
                        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="bg-card border-2 border-primary/20 p-6 rounded-3xl shadow-2xl max-w-md w-full relative z-10 space-y-4"
                    >
                        <div className="flex items-center gap-3 text-primary border-b border-border pb-3">
                            <Info className="w-6 h-6" />
                            <h3 className="text-lg font-black uppercase tracking-tight">
                                Validación necesaria
                            </h3>
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-foreground/80">
                            {validationError}
                        </p>
                        <button
                            onClick={() => setValidationError(null)}
                            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg active:scale-[0.98] transition-all"
                        >
                            Entendido
                        </button>
                    </motion.div>
                </div>
            }
        </AnimatePresence>
    );
};
