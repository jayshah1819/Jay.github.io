'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Intro() {
  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-4">
        <motion.span
          className="text-white text-7xl font-bold tracking-widest uppercase"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.6,
            ease: 'easeOut',
            delay: 0.1
          }}
        >
          JAY
        </motion.span>
        <motion.span
          className="text-white text-7xl font-bold tracking-widest uppercase"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.6,
            ease: 'easeOut',
            delay: 0.4
          }}
        >
          SHAH
        </motion.span>
      </div>
    </motion.div>
  );
} 