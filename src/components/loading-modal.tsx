"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
interface LoadingModalProps {
  readonly isOpen: boolean
  readonly message: string
}
export function LoadingModal({ isOpen, message }: LoadingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <Card className="w-full max-w-sm">
              <CardContent className="px-8 py-2 text-center">
                  <div className="flex flex-col items-center justify-center py-0">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full border-4 border-t-blue-400 border-r-blue-400 border-b-transparent border-l-transparent animate-spin"></div>
                      <div className="absolute inset-2 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-blue-500 animate-spin"></div>
                    </div>
                    <p className="mt-4 text-gray-500 font-medium">
                      {message}
                    </p>
                  </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
