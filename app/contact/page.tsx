'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Linkedin, Github, ExternalLink } from 'lucide-react';

export default function Contact() {
  return (
    <div className="bg-[#1E1E1E] text-white min-h-screen font-sans">
      <header className="flex justify-between items-center p-6">
        <div className="text-3xl font-extrabold">
          <span>Aus</span><br /><span>Pham.</span>
        </div>
        <nav className="space-x-6 text-gray-400">
          <Link href="/" className="hover:text-white">Profile</Link>
          <Link href="/showcases" className="hover:text-white">Showcases</Link>
          <Link href="/projects" className="hover:text-white">Projects</Link>
          <Link href="/contact" className="text-white border-b-2 border-pink-300">Contact</Link>
        </nav>
        <div>
          <button className="bg-white w-8 h-8 rounded-full"></button>
        </div>
      </header>

      <section className="px-8">
        <h1 className="text-3xl font-bold pt-6">Experience.</h1>
        <p className="text-gray-400 pt-2 pb-8 max-w-2xl">
          My professional journey and achievements in software engineering and technology management.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold">hrivePix LLC (Remote)</h2>
              <h3 className="text-lg text-gray-400">Software Engineer – Backend (Java)</h3>
              <p className="text-sm text-gray-500">June 2021 - July 2023</p>
              <ul className="mt-4 space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Designed and built backend microservices using Java and Spring Boot; optimised data access with Hibernate, improving system performance by 25%.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Led CI/CD improvements via Jenkins and GitHub Actions; reduced deployment time by 30%.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Developed and executed over 150+ unit/integration tests using JUnit, Mockito, and Postman for REST APIs.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Collaborated cross-functionally with Product, QA, and DevOps in an Agile/Scrum environment.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Oversaw technology management for backend services, ensuring system uptime and deployment efficiency.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold">Roesch Library, University of Dayton</h2>
              <h3 className="text-lg text-gray-400">Student Manager</h3>
              <p className="text-sm text-gray-500">April 2024 - Current</p>
              <ul className="mt-4 space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Provided technical and printer support to 200+ students and faculty across 68 departments.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Assisted with system troubleshooting, debugging, and user experience enhancement across platforms.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
          <div className="flex space-x-6">
            <a href="mailto:your@email.com" className="text-gray-400 hover:text-white transition-colors duration-300">
              <Mail size={24} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300">
              <Linkedin size={24} />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300">
              <Github size={24} />
            </a>
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