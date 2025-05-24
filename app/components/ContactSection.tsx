"use client";

import React from 'react';
import { motion, useMotionValue, useTransform, useMotionValueEvent, useInView, animate } from "framer-motion";
import { useState, useEffect, useRef } from "react";

export default function ContactSection() {
  const xDrag = useMotionValue(0);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  // Folding animations
  const xLeft = useTransform(xDrag, [0, 300], ["100%", "0%"]);
  const xRight = useTransform(xDrag, [0, 300], ["-100%", "0%"]);
  const centerScale = useTransform(xDrag, [150, 300], [0, 1]);
  const centerOpacity = useTransform(xDrag, [150, 300], [0, 1]);

  // Auto-animate when in view
  useEffect(() => {
    if (isInView) {
      animate(xDrag, 300, {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 1
      });
      setIsOpen(true);
    } else {
      animate(xDrag, 0, {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 1
      });
      setIsOpen(false);
    }
  }, [isInView, xDrag]);

  useMotionValueEvent(xDrag, "change", (latest) => {
    if (latest > 260) setIsOpen(true);
    else setIsOpen(false);
  });

  return (
    <div ref={ref} className="relative w-full max-w-4xl mx-auto p-4 overflow-hidden">
      <div className="grid grid-cols-3 aspect-[4/3] w-full max-w-2xl mx-auto relative">
        {/* Left Panel */}
        <motion.div 
          className="bg-[#181a1b] border border-gray-800 rounded-l-xl p-6"
          style={{ x: xLeft }}
        >
          <div className="h-full flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-white mb-4">Contact Me</h2>
            <p className="text-gray-400">
              Feel free to reach out if you want to build something together, have a question, or just want to connect.
            </p>
          </div>
        </motion.div>

        {/* Center Panel */}
        <motion.div 
          className="bg-[#181a1b] border-y border-gray-800 p-6"
          style={{ scale: centerScale, opacity: centerOpacity }}
        >
          <div className="h-full flex flex-col justify-center space-y-4">
            <p className="text-gray-400"><strong>📍</strong> Edison, NJ</p>
            <p className="text-gray-400"><strong>📞</strong> (937)-414-7823</p>
            <p className="text-gray-400"><strong>📧</strong> jayshah.jk.jk18@gmail.com</p>
          </div>
        </motion.div>

        {/* Right Panel */}
        <motion.div 
          className="bg-[#181a1b] border border-gray-800 rounded-r-xl p-6"
          style={{ x: xRight }}
        >
          <div className="h-full flex flex-col justify-center space-y-4">
            <p className="text-gray-400">
              <strong>🔗</strong> <a href="https://linkedin.com/in/jayshah018" className="text-green-400 hover:text-green-300 transition-colors">LinkedIn</a>
            </p>
            <p className="text-gray-400">
              <strong>💻</strong> <a href="https://github.com/jayshah1819" className="text-green-400 hover:text-green-300 transition-colors">GitHub</a>
            </p>
          </div>
        </motion.div>

        {/* Draggable Overlay */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 300 }}
          _dragX={xDrag}
          dragTransition={{
            modifyTarget: (target) => (target > 150 ? 300 : 0),
            timeConstant: 45,
          }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
        />
      </div>
    </div>
  );
} 