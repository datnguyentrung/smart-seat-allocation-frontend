import { AlertTriangle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-6"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-[320px] h-fit bg-[#252525] border border-white/10 rounded-2xl p-6 z-101 shadow-2xl flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="text-amber-500" size={32} />
            </div>

            <h3 className="text-white text-lg font-bold mb-2 tracking-tight">
              {title}
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              {message}
            </p>

            <button
              onClick={onClose}
              className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors active:scale-95"
            >
              Understood
            </button>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
