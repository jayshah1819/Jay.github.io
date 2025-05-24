'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Mail, Linkedin, Github, ExternalLink, Menu, X, Code } from 'lucide-react';
import * as THREE from 'three';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { Flipper, Flipped } from 'react-flip-toolkit';
import ContactSection from './components/ContactSection';
import Intro from './components/Intro';

// --- Three.js Background Component ---
interface HeroBackgroundCanvasProps {
  mousePosition: {
    x: number;
    y: number;
  };
}

const HeroBackgroundCanvas = ({ mousePosition }: HeroBackgroundCanvasProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const uniformsRef = useRef({
    u_time: { value: 0.0 },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_resolution: { value: new THREE.Vector2(0, 0) },
    u_aspect: { value: 0 }
  });

  // Vertex Shader
  const vertexShader = `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Fragment Shader
  const fragmentShader = `
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform vec2 u_resolution;
    uniform float u_aspect;

    float hash(float n) { return fract(sin(n) * 43758.5453123); }
    float hash(vec2 p) {
        return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i + vec2(0.0, 0.0));
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
        float f = 0.0;
        f += 0.5000 * noise(p);
        f += 0.2500 * noise(p * 2.0);
        f += 0.1250 * noise(p * 4.0);
        f += 0.0625 * noise(p * 8.0);
        return f / 0.9375;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 centeredUv = uv - 0.5;
      centeredUv.x *= u_aspect;

      vec2 mouseNormalized = u_mouse / u_resolution;
      vec2 mouseCentered = mouseNormalized - 0.5;
      mouseCentered.x *= u_aspect;

      vec2 p = centeredUv * 3.0;
      p += vec2(sin(u_time * 0.05), cos(u_time * 0.03)) * 0.1;

      float n = fbm(p + u_time * 0.02);
      float n2 = fbm(p * 2.0 - u_time * 0.01);

      float lines = smoothstep(0.49, 0.51, abs(sin(p.x * 10.0 + u_time * 0.1))) * 0.2;
      lines += smoothstep(0.49, 0.51, abs(cos(p.y * 10.0 + u_time * 0.08))) * 0.2;

      float finalPattern = (n + n2 * 0.5) * lines * 0.1;

      float distToMouse = length(centeredUv - mouseCentered * 0.2);
      float mouseGlow = smoothstep(0.3, 0.0, distToMouse) * 0.3;

      vec3 color_base = vec3(0.05, 0.05, 0.05);
      vec3 color_subtle_accent = vec3(0.1, 0.05, 0.05);
      vec3 color_mouse_glow = vec3(0.2, 0.1, 0.1);

      vec3 finalColor = mix(color_base, color_subtle_accent, finalPattern);
      finalColor += color_mouse_glow * mouseGlow;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      uniformsRef.current.u_resolution.value.set(window.innerWidth, window.innerHeight);
      uniformsRef.current.u_aspect.value = window.innerWidth / window.innerHeight;
    }
  }, []);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    camera.position.z = 1;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    if (currentMount) {
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      currentMount.appendChild(renderer.domElement);
    }
    rendererRef.current = renderer;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: uniformsRef.current,
      vertexShader,
      fragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const animate = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        uniformsRef.current.u_time.value += 0.01;
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        requestAnimationFrame(animate);
      }
    };
    animate();

    const onWindowResize = () => {
      if (currentMount && rendererRef.current) {
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;
        rendererRef.current.setSize(width, height);
        uniformsRef.current.u_resolution.value.set(width, height);
        uniformsRef.current.u_aspect.value = width / height;
        if (cameraRef.current) {
          cameraRef.current.updateProjectionMatrix();
        }
      }
    };

    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (currentMount && rendererRef.current?.domElement) {
        currentMount.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      geometry.dispose();
      material.dispose();
    };
  }, []);

  useEffect(() => {
    if (uniformsRef.current) {
      uniformsRef.current.u_mouse.value.set(mousePosition.x, mousePosition.y);
    }
  }, [mousePosition]);

  return <div ref={mountRef} className="fixed inset-0 w-full h-full -z-10" />;
};

// Add this before the Home component
const ProjectCard = ({ title, description, tags, language, stars, link }: {
  title: string;
  description: string;
  tags: string[];
  language: string;
  stars: number;
  link: string;
}) => {
  return (
    <div className="group relative border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-gray-700 bg-black">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code size={24} className="text-gray-400" />
          <h4 className="text-xl font-bold text-white">{title}</h4>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          {description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-400">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Code size={16} /> {language}
            </span>
            <span className="flex items-center gap-1">
              <Github size={16} /> {stars}
            </span>
          </div>
          <a 
            href={link} 
            className="text-gray-400 hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Project <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sectionsRef = useRef([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2000); // 2 seconds intro
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLAnchorElement;
      const href = target.getAttribute('href');
      if (!href) return;
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleScroll);
    });

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', handleScroll);
      });
    };
  }, []);

  // Add this before the Home component
  const projects = [
    {
      title: "E-Commerce Application",
      description: "A scalable e-commerce platform with real-time inventory management and microservices architecture.",
      tags: ["Java", "Spring Boot", "Kafka", "Docker"],
      language: "Java",
      stars: 12,
      link: "#"
    },
    {
      title: "Train Booking System",
      description: "A microservices-based train booking system with real-time operations and secure authentication.",
      tags: ["Java", "Spring Boot", "Kafka", "Keycloak"],
      language: "Java",
      stars: 8,
      link: "#"
    },
    {
      title: "AI-Powered Fitness App",
      description: "An AI-driven fitness application with personalized workout and nutrition recommendations.",
      tags: ["Spring Boot", "RabbitMQ", "Gemini API"],
      language: "Java",
      stars: 15,
      link: "#"
    },
    {
      title: "sklearn2-RMITAI2020-Replays",
      description: "Replays of team sklearn2 RMIT AI 2020 Pacman Contest",
      tags: ["HTML", "AI", "Pacman"],
      language: "HTML",
      stars: 0,
      link: "#"
    }
  ];

  return (
    <main className="min-h-screen text-white font-sans antialiased overflow-x-hidden relative bg-black">
      <AnimatePresence>
        {showIntro && <Intro />}
      </AnimatePresence>
      
      {!showIntro && (
        <>
          {/* Progress Bar */}
          <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500 origin-left z-50"
            style={{ scaleX }}
          />

          {/* Left Navigation Bar */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="fixed left-0 top-0 h-full w-16 bg-black border-r border-gray-800 hidden md:block z-50"
          >
            <div className="h-full flex flex-col items-center justify-center space-y-4 relative">
              {/* Long vertical line effect */}
              <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gradient-to-b from-gray-400/70 to-gray-700/0 z-0" style={{transform: 'translateX(-50%)'}} />
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ 
                  delay: 1.6,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className="rotate-90 text-xs text-gray-400 mb-4 opacity-50 hover:opacity-100 transition-opacity duration-300 z-10 bg-black px-2 py-1 rounded shadow"
              >
                SCROLL DOWN
              </motion.div>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: 1.8 + i * 0.2,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{ 
                    scale: 1.2,
                    x: -10,
                    transition: { duration: 0.2 }
                  }}
                  className="w-6 h-0.5 bg-gray-400 opacity-50 hover:opacity-100 transition-opacity duration-300 z-10"
                />
              ))}
            </div>
          </motion.div>

          {/* Right Navigation Bar */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="fixed right-0 top-0 h-full w-16 bg-black border-l border-gray-800 hidden md:block z-50"
          >
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8 }}
                className="w-6 h-0.5 bg-gray-400 opacity-50 group-hover:opacity-100 transition-opacity duration-300"
              />
              {[
                { icon: <Github size={24} />, link: 'https://github.com/jayshah1819' },
                { icon: <Linkedin size={24} />, link: 'https://linkedin.com/in/jayshah018' },
                { icon: <Mail size={24} />, link: 'mailto:jayshah.jk.jk18@gmail.com' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: 2 + i * 0.2,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{ 
                    scale: 1.2,
                    x: 10,
                    transition: { duration: 0.2 }
                  }}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.icon}
                  </a>
                </motion.div>
              ))}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: 2.6,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className="w-6 h-0.5 bg-gray-400 opacity-50 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </motion.div>

          {/* Main Content - Add padding for the side bars */}
          <div className="md:ml-16 md:mr-16 flex justify-center">
            <div className="w-full max-w-5xl">
              {/* Header */}
              <motion.header 
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15, mass: 1 }}
                className="py-6 px-6 flex justify-between items-center backdrop-blur-sm sticky top-0 z-50 bg-black border-b border-gray-800"
              >
                <motion.div 
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 12 }}
                  whileHover={{ scale: 1.08, color: '#38bdf8' }}
                  className="flex flex-row items-center gap-3 text-3xl font-extrabold text-white text-left cursor-pointer select-none tracking-widest uppercase"
                >
                  <span>JAY</span>
                  <span>SHAH</span>
                </motion.div>

                {/* ...existing right-side nav/menu code... */}
              </motion.header>

              {/* Mobile Menu */}
              <motion.div 
                initial={{ x: '100%', opacity: 0 }}
                animate={{ 
                  x: isMenuOpen ? 0 : '100%',
                  opacity: isMenuOpen ? 1 : 0
                }}
                transition={{ 
                  type: 'spring',
                  stiffness: 100,
                  damping: 15,
                  mass: 1
                }}
                className="fixed inset-0 bg-black bg-opacity-95 z-40 flex flex-col items-center justify-center md:hidden"
              >
                <motion.button
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="absolute top-6 right-6 focus:outline-none text-white"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <X size={36} />
                </motion.button>
                <motion.ul 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col space-y-8 text-3xl font-bold text-center"
                >
                  <motion.li
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <a href="#hero" className="text-white hover:text-gray-400 transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Profile</a>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <a href="#experience" className="text-white hover:text-gray-400 transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Experience</a>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <a href="#projects" className="text-white hover:text-gray-400 transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Projects</a>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <a href="#contact" className="text-white hover:text-gray-400 transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Contact</a>
                  </motion.li>
                </motion.ul>
              </motion.div>

              {/* Hero Section */}
              <section id="hero" className="relative min-h-[60vh] flex flex-col justify-center px-6 py-16 bg-black border-b border-gray-800">
                <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                  <div className="flex-1 max-w-lg md:mr-8 lg:mr-16 xl:mr-24 order-2 md:order-1">
                    <div className="bg-transparent border-none p-0 shadow-none">
                      <h2 className="text-2xl font-semibold text-left mb-4 text-gray-100">Graduate Student, University of Dayton</h2>
                      <p className="text-gray-300 text-left text-xs md:text-sm leading-relaxed mb-0">
                        I am passionate about solving complex problems at the intersection of software engineering, cloud infrastructure, and machine learning.<br/><br/>
                        I thrive on building scalable, high-performance systems and transforming ideas into robust, user-centric solutions.<br/><br/>
                        My experience spans backend development, DevOps, and IoT, with a focus on clean, maintainable code and seamless user experiences.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center md:justify-end items-center mt-8 md:mt-0 order-1 md:order-2">
                    <img 
                      src="/profile.png" 
                      alt="Jay Shah profile photo" 
                      className="w-56 h-56 md:w-72 md:h-72 rounded-lg object-cover border-4 border-gray-700 shadow-2xl grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300 bg-gray-900" 
                    />
                  </div>
                </div>
              </section>

              {/* Experience Section */}
              <section id="experience" className="py-16 border-b border-gray-800">
                <h2 className="text-2xl font-bold mb-8 text-left">Experience</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Experience Item 1 */}
                  <div className="flex flex-col h-full border-l-4 border-white pl-6 bg-black rounded-lg shadow-sm">
                    <div className="mb-2">
                      <h3 className="text-xl font-semibold text-left">Software Engineer – Backend (Java)</h3>
                      <a href="#" className="text-gray-400 hover:underline text-left block">ThrivePix LLC</a>
                      <div className="text-gray-400 text-sm mt-1">June 2021 - July 2023 · Remote</div>
                    </div>
                    <div className="text-gray-300 text-left mt-2 flex-1 space-y-2">
                      <div>Designed and built backend microservices using Java and Spring Boot; optimised data access with Hibernate, improving system performance by 25%.</div>
                      <div>Led CI/CD improvements via Jenkins and GitHub Actions; reduced deployment time by 30%.</div>
                      <div>Developed and executed over 150+ unit/integration tests using JUnit, Mockito, and Postman for REST APIs.</div>
                      <div>Collaborated cross-functionally with Product, QA, and DevOps in an Agile/Scrum environment.</div>
                      <div>Oversaw technology management for backend services, ensuring system uptime and deployment efficiency.</div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">Java</span>
                      <span className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">Spring Boot</span>
                      <span className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">Jenkins</span>
                      <span className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">GitHub Actions</span>
                      <span className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">Hibernate</span>
                    </div>
                  </div>
                  {/* Experience Item 2 */}
                  <div className="flex flex-col h-full border-l-4 border-white pl-6 bg-black rounded-lg shadow-sm">
                    <div className="mb-2">
                      <h3 className="text-xl font-semibold text-left">Student Manager</h3>
                      <a href="#" className="text-gray-400 hover:underline text-left block">Roesch Library, University of Dayton</a>
                      <div className="text-gray-400 text-sm mt-1">April 2024 - Current</div>
                    </div>
                    <div className="text-gray-300 text-left mt-2 flex-1 space-y-2">
                      <div>Provided technical and printer support to 200+ students and faculty across 68 departments.</div>
                      <div>Assisted with system troubleshooting, debugging, and user experience enhancement across platforms.</div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">Technical Support</span>
                      <span className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">Management</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contributions Section */}
              <section id="contributions" className="py-16 border-b border-gray-800">
                <h2 className="text-2xl font-bold mb-8 text-left">Contributions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Contribution Item 1 */}
                  <div className="border border-gray-800 rounded-lg p-6 bg-black flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-left mb-1">Java Pathfinder</h3>
                      <a href="#" className="text-gray-400 hover:underline text-left block mb-2">Open Source</a>
                      <div className="text-gray-400 text-sm mb-2">2023</div>
                      <div className="text-gray-300 text-left mb-2">Enhanced regex pattern matching and implemented BDD testing in the JPCORE module.</div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">Java</span>
                      <span className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">Regex</span>
                      <span className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">BDD</span>
                      <span className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">Testing</span>
                    </div>
                  </div>
                  {/* Contribution Item 2 */}
                  <div className="border border-gray-800 rounded-lg p-6 bg-black flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-left mb-1">Jenkins Tekton Client Plugin</h3>
                      <a href="#" className="text-gray-400 hover:underline text-left block mb-2">Open Source</a>
                      <div className="text-gray-400 text-sm mb-2">2023</div>
                      <div className="text-gray-300 text-left mb-2">Refactored code for better modularity and added comprehensive unit tests for cross-platform support.</div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">Java</span>
                      <span className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">Jenkins</span>
                      <span className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">Testing</span>
                      <span className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">DevOps</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Projects Section */}
              <section id="projects" className="py-16 border-b border-gray-800">
                <h2 className="text-2xl font-bold mb-8 text-left">Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Project Items */}
                  {projects.map((project, index) => (
                    <div key={index} className="border border-gray-800 rounded-lg p-6 bg-black flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-left mb-1">{project.title}</h3>
                        <a href={project.link} className="text-gray-400 hover:underline text-left block mb-2">Personal Project</a>
                        <div className="text-gray-400 text-sm mb-2">2023</div>
                        <div className="text-gray-300 text-left mb-2">{project.description}</div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Contact Section */}
              <section id="contact" className="py-16">
                <h2 className="text-2xl font-bold mb-8 text-left">Contact</h2>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 bg-black border border-gray-800 rounded-lg p-8 shadow-lg">
                  <div className="flex flex-col gap-2 text-left">
                    <div className="flex items-center gap-3">
                      <Mail className="text-blue-400" size={20} />
                      <a href="mailto:jayshah.jk.jk18@gmail.com" className="text-blue-400 hover:underline font-medium">jayshah.jk.jk18@gmail.com</a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Linkedin className="text-blue-400" size={20} />
                      <a href="https://linkedin.com/in/jayshah018" className="text-blue-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Github className="text-blue-400" size={20} />
                      <a href="https://github.com/jayshah1819" className="text-blue-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-left md:text-right">
                    <div className="text-gray-300 font-semibold text-lg">Edison, NJ</div>
                    <div className="text-gray-400 text-base">(937)-414-7823</div>
                  </div>
                </div>
              </section>

              <footer className="text-center text-gray-400 text-sm mt-20 mb-10">
                Handcrafted by Jay Shah © 2024.
              </footer>
            </div>
          </div>

          {/* Add smooth scroll behavior to the entire page */}
          <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Pacifico&display=swap');
            .font-handwriting {
              font-family: 'Pacifico', cursive;
              letter-spacing: 0.01em;
            }

            html {
              scroll-behavior: smooth;
              scroll-snap-type: y mandatory;
              font-family: 'Inter', sans-serif;
            }

            body {
              margin: 0;
              padding: 0;
              background-color: #000;
              color: #fff;
              font-size: 16px;
              line-height: 1.6;
            }

            h1, h2 {
              font-weight: 700;
              margin-bottom: 0.5rem;
            }

            .subtitle {
              font-weight: 400;
              color: #aaa;
              font-size: 1.2rem;
            }

            .section-title {
              font-size: 0.9rem;
              color: #aaa;
              text-transform: uppercase;
              margin-top: 2rem;
              margin-bottom: 1rem;
            }

            .experience {
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
              gap: 2rem;
              border-top: 1px solid #222;
              padding-top: 2rem;
            }

            .experience-entry {
              max-width: 48%;
            }

            ul {
              padding-left: 1rem;
            }

            ul li {
              margin-bottom: 0.5rem;
            }

            .contact {
              color: #ccc;
              text-decoration: none;
              display: block;
              margin-top: 1rem;
            }

            .contact:hover {
              color: #fff;
            }

            section {
              scroll-snap-align: start;
            }
          `}</style>
        </>
      )}
    </main>
  );
}