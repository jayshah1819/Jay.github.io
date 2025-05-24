'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Linkedin, Github, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Showcases() {
  const [showHero, setShowHero] = React.useState(false);
  const [showWhite, setShowWhite] = React.useState(false);
  const [settleNav, setSettleNav] = React.useState(false);

  React.useEffect(() => {
    const t1 = setTimeout(() => setShowHero(true), 3000);
    const t2 = setTimeout(() => setShowWhite(true), 3500);
    const t3 = setTimeout(() => setSettleNav(true), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="bg-[#1E1E1E] text-white min-h-screen font-sans">
      {/* Animated JAY SHAH intro overlay */}
      <AnimatePresence>
        {!showHero && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className={`fixed inset-0 z-50 flex items-center justify-center ${showWhite ? 'bg-white' : 'bg-black'}`}
          >
            <motion.h1
              initial={{ color: '#fff', backgroundColor: '#000' }}
              animate={showWhite ? { color: '#000', backgroundColor: '#fff' } : {}}
              transition={{ duration: 0.5 }}
              className={`text-5xl md:text-7xl font-extrabold px-8 py-4 rounded-lg shadow-lg tracking-widest ${showWhite ? 'text-black' : 'text-white'}`}
              style={{ letterSpacing: '0.3em' }}
            >
              JAY SHAH
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Navbar with animated JAY SHAH settling */}
      <header className="flex justify-between items-center p-6">
        <motion.div
          initial={{ position: 'fixed', top: '50%', left: '50%', x: '-50%', y: '-50%', zIndex: 40 }}
          animate={settleNav ? { position: 'static', top: 'auto', left: 'auto', x: 0, y: 0, zIndex: 0 } : {}}
          transition={{ duration: 0.7, type: 'spring', stiffness: 80 }}
          className="text-3xl font-extrabold tracking-widest text-black bg-white px-4 py-2 rounded shadow"
          style={{ letterSpacing: '0.3em', transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)' }}
        >
          JAY SHAH
        </motion.div>
        <nav className="space-x-6 text-gray-400">
          <Link href="/" className="hover:text-white">Profile</Link>
          <Link href="/showcases" className="text-white border-b-2 border-pink-300">Showcases</Link>
          <Link href="/projects" className="hover:text-white">Projects</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
        </nav>
        <div>
          <button className="bg-white w-8 h-8 rounded-full"></button>
        </div>
      </header>

      {/* Left vertical line, SCROLL DOWN box, and three short lines */}
      <div className="fixed left-0 top-0 h-full w-16 flex flex-col items-center justify-center z-20">
        <div className="relative flex flex-col items-center h-full w-full">
          {/* Long vertical line */}
          <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gradient-to-b from-gray-400/70 to-gray-700/0 z-0" style={{transform: 'translateX(-50%)'}} />
          {/* SCROLL DOWN box */}
          <div className="rotate-90 text-xs text-gray-400 mb-4 opacity-50 hover:opacity-100 transition-opacity duration-300 z-10 bg-black px-2 py-1 rounded shadow">
            SCROLL DOWN
          </div>
          {/* Three short lines */}
          <div className="flex flex-col items-center space-y-2 z-10 mt-2">
            <div className="w-6 h-0.5 bg-gray-400 opacity-50 hover:opacity-100 transition-opacity duration-300" />
            <div className="w-6 h-0.5 bg-gray-400 opacity-50 hover:opacity-100 transition-opacity duration-300" />
            <div className="w-6 h-0.5 bg-gray-400 opacity-50 hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </div>

      <section className="px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Showcases.</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Showcase Item 1 */}
          <div className="bg-[#2A2A2A] p-6 rounded-lg hover:transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-xl font-bold mb-4">Project Name 1</h2>
            <p className="text-gray-400 mb-4">
              Brief description of the project and its key features. Highlight the technologies used and your role in the project.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-pink-300 hover:text-pink-400 transition-colors duration-300">
                <ExternalLink size={20} />
              </a>
              <a href="#" className="text-pink-300 hover:text-pink-400 transition-colors duration-300">
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Showcase Item 2 */}
          <div className="bg-[#2A2A2A] p-6 rounded-lg hover:transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-xl font-bold mb-4">Project Name 2</h2>
            <p className="text-gray-400 mb-4">
              Brief description of the project and its key features. Highlight the technologies used and your role in the project.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-pink-300 hover:text-pink-400 transition-colors duration-300">
                <ExternalLink size={20} />
              </a>
              <a href="#" className="text-pink-300 hover:text-pink-400 transition-colors duration-300">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <aside className="fixed right-6 top-1/2 transform -translate-y-1/2 text-sm space-y-4 text-gray-300">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">• Git</a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">• In</a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">• Tw</a>
        <a href="mailto:your@email.com" className="hover:text-white transition-colors duration-300">• Mail</a>
      </aside>
    </div>
  );
}