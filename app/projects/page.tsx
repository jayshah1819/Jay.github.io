'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Linkedin, Github, ExternalLink } from 'lucide-react';

export default function Projects() {
  return (
    <div className="bg-[#1E1E1E] text-white min-h-screen font-sans" style={{ cursor: 'auto' }}>
      <header className="flex justify-between items-center p-6">
        <div className="text-3xl font-extrabold text-base">
          <div className="font-extrabold text-xs">
            <span>Graduate Student, University of Dayton</span>
            <div className="w-6 h-0.5 bg-white mt-2"></div>
          </div>
        </div>
        <nav className="space-x-6 text-gray-400">
          <Link href="/" className="hover:text-white">Profile</Link>
          <Link href="/showcases" className="hover:text-white">Showcases</Link>
          <Link href="/projects" className="text-white border-b-2 border-pink-300">Projects</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
        </nav>
        <div>
          <a href="https://jJay.github.io" target="_blank" rel="noopener noreferrer">
            <button className="bg-white w-8 h-8 rounded-full flex items-center justify-center" title="My GitHub Portfolio">
              <Github size={20} className="text-black" />
            </button>
          </a>
        </div>
      </header>

      <section className="px-8 py-12">
        <h1 className="text-3xl font-bold mb-2">Contributions</h1>
        <div className="w-6 h-0.5 bg-white mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Java Pathfinder Contribution */}
          <div className="bg-[#2A2A2A] p-6 rounded-lg hover:transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-xl font-bold mb-1">Java Pathfinder</h2>
            <div className="text-xs text-gray-400 mb-1">
              <a href="https://github.com/javapathfinder/jpf-core/pull/529" target="_blank" rel="noopener noreferrer" className="underline hover:text-pink-300">Open Source</a>
            </div>
            <div className="text-xs text-gray-400 mb-2">2025</div>
            <p className="text-gray-400 mb-4">
              Enhanced regex pattern matching and implemented BDD testing in the JPCORE module.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-[#3A3A3A] rounded-full text-xs">Java</span>
              <span className="px-3 py-1 bg-[#3A3A3A] rounded-full text-xs">Regex</span>
              <span className="px-3 py-1 bg-[#3A3A3A] rounded-full text-xs">BDD</span>
              <span className="px-3 py-1 bg-[#3A3A3A] rounded-full text-xs">Testing</span>
            </div>
          </div>

          {/* Jenkins Tekton Client Plugin Contribution */}
          <div className="bg-[#2A2A2A] p-6 rounded-lg hover:transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-xl font-bold mb-1">Jenkins Tekton Client Plugin</h2>
            <div className="text-xs text-gray-400 mb-1">
              <a href="https://github.com/jenkinsci/tekton-client-plugin/pull/385" target="_blank" rel="noopener noreferrer" className="underline hover:text-pink-300">Open Source</a>
            </div>
            <div className="text-xs text-gray-400 mb-2">2025</div>
            <p className="text-gray-400 mb-4">
              Refactored code for better modularity and added comprehensive unit tests for cross-platform support.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-[#3A3A3A] rounded-full text-xs">Java</span>
              <span className="px-3 py-1 bg-[#3A3A3A] rounded-full text-xs">Jenkins</span>
              <span className="px-3 py-1 bg-[#3A3A3A] rounded-full text-xs">Testing</span>
              <span className="px-3 py-1 bg-[#3A3A3A] rounded-full text-xs">DevOps</span>
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