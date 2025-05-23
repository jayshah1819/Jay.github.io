'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Linkedin, Github, ExternalLink } from 'lucide-react';

export default function Showcases() {
  return (
    <div className="bg-[#1E1E1E] text-white min-h-screen font-sans">
      <header className="flex justify-between items-center p-6">
        <div className="text-3xl font-extrabold">
          <span>Your</span><br /><span>Name.</span>
        </div>
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

      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 space-y-4">
        <div className="w-6 h-0.5 bg-white"></div>
        <div className="w-6 h-0.5 bg-white"></div>
        <div className="w-6 h-0.5 bg-white"></div>
        <div className="w-6 h-0.5 bg-white"></div>
      </div>
    </div>
  );
} 