'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Mail, Linkedin, Github, ExternalLink, Menu, X, Code } from 'lucide-react';
import * as THREE from 'three';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Flipper, Flipped } from 'react-flip-toolkit';

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
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <Flipped flipId={title}>
      <div 
        className="group relative border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-gray-700 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Code size={24} className="text-green-400" />
            <h4 className="text-xl font-bold text-white">{title}</h4>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            {description}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300">
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
              className="text-green-400 hover:text-green-300 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              View Project <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    </Flipped>
  );
};

// --- Main App Component ---
export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sectionsRef = useRef([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

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
    <div className="min-h-screen text-white font-sans antialiased overflow-x-hidden relative bg-[#181a1b]">
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
        className="fixed left-0 top-0 h-full w-16 bg-[#181a1b] border-r border-gray-800 hidden md:block z-50"
      >
        <div className="h-full flex flex-col items-center justify-center space-y-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className={`rotate-90 text-xs text-white mb-4 opacity-50 hover:opacity-100 transition-opacity duration-300`}
          >
            SCROLL DOWN
          </motion.div>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8 + i * 0.1 }}
              className="w-6 h-0.5 bg-white opacity-50 hover:opacity-100 transition-opacity duration-300"
            />
          ))}
        </div>
      </motion.div>

      {/* Right Navigation Bar */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="fixed right-0 top-0 h-full w-16 bg-[#181a1b] border-l border-gray-800 hidden md:block z-50"
      >
        <div className="h-full flex flex-col items-center justify-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8 }}
            className="w-6 h-0.5 bg-white opacity-50 group-hover:opacity-100 transition-opacity duration-300"
          />
          {['Git', 'In', 'Mail'].map((link, i) => (
            <motion.div
              key={link}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2 + i * 0.1 }}
              className="rotate-90 group"
            >
              <a 
                href={link === 'Git' ? 'https://github.com/jayshah1819' : 
                      link === 'In' ? 'https://linkedin.com/in/jayshah018' : 
                      'mailto:jayshah.jk.jk18@gmail.com'} 
                className="hover:text-white transition-all duration-300 text-lg hover:scale-110 inline-block"
              >
                {link}
              </a>
            </motion.div>
          ))}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.3 }}
            className="w-6 h-0.5 bg-white opacity-50 group-hover:opacity-100 transition-opacity duration-300"
          />
        </div>
      </motion.div>

      {/* Main Content - Add padding for the side bars */}
      <div className="md:ml-16 md:mr-16">
        {/* Header */}
        <header className="py-6 px-6 flex justify-between items-center backdrop-blur-sm sticky top-0 z-50 bg-[#181a1b]">
          <div className="text-3xl font-extrabold">
            <span>Jay</span><br /><span>Shah</span>
          </div>
          <nav className="hidden md:block space-x-6 text-gray-400">
            <ul className="flex space-x-6 text-lg font-medium">
              <li>
                <a href="#hero" className="relative px-4 py-2 text-white">
                  <span className="relative z-10">Profile</span>
                  <span className="absolute inset-0 bg-white opacity-10 rounded-lg"></span>
                </a>
              </li>
              <li>
                <a href="#experience" className="relative px-4 py-2 hover:text-white transition-colors duration-300">
                  <span className="relative z-10">Experience</span>
                  <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 rounded-lg transition-opacity duration-300"></span>
                </a>
              </li>
              <li>
                <a href="#projects" className="relative px-4 py-2 hover:text-white transition-colors duration-300">
                  <span className="relative z-10">Projects</span>
                  <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 rounded-lg transition-opacity duration-300"></span>
                </a>
              </li>
              <li>
                <a href="#contributions" className="relative px-4 py-2 hover:text-white transition-colors duration-300">
                  <span className="relative z-10">Contributions</span>
                  <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 rounded-lg transition-opacity duration-300"></span>
                </a>
              </li>
              <li>
                <a href="#contact" className="relative px-4 py-2 hover:text-white transition-colors duration-300">
                  <span className="relative z-10">Contact</span>
                  <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 rounded-lg transition-opacity duration-300"></span>
                </a>
              </li>
            </ul>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="w-8 h-8 rounded-full bg-white"></button>
            <button
              className="md:hidden text-white focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        <div className={`fixed inset-0 bg-black bg-opacity-95 z-40 flex flex-col items-center justify-center transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
          <button
            className="absolute top-6 right-6 focus:outline-none text-white"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={36} />
          </button>
          <ul className="flex flex-col space-y-8 text-3xl font-bold text-center">
            <li><a href="#hero" className="text-white hover:text-gray-400 transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Profile</a></li>
            <li><a href="#experience" className="text-white hover:text-gray-400 transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Experience</a></li>
            <li><a href="#projects" className="text-white hover:text-gray-400 transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Projects</a></li>
            <li><a href="#contact" className="text-white hover:text-gray-400 transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Contact</a></li>
          </ul>
        </div>

        {/* Hero Section */}
        <section id="hero" className="relative h-screen flex items-center px-10 overflow-hidden bg-[#181a1b] snap-start">
          <HeroBackgroundCanvas mousePosition={mousePos} />

          <div className="relative z-10 flex flex-col lg:flex-row items-start justify-end w-full max-w-7xl mx-auto">
            <div className="flex flex-col items-start text-left lg:w-1/2 space-y-6 lg:ml-auto lg:max-w-xl">
              <motion.h1 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8,
                  ease: [0.6, -0.05, 0.01, 0.99]
                }}
                className="text-3xl font-bold text-gradient"
              >
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="block text-2xl font-bold"
                >
                  Hello,
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="block mt-2 text-3xl font-bold"
                >
                  My name is Jay Shah
                </motion.span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: 0.6,
                  duration: 0.8,
                  ease: "easeOut"
                }}
              >
                I'm a graduate student from UD.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.8,
                  duration: 0.8,
                  ease: "easeOut"
                }}
                className="space-y-4 max-w-md"
              >
                <p>
                  My areas of interest include problem-solving, cloud infrastructure, machine learning, and IoT.
                </p>
                <p>
                  With a detail oriented-focus, I enjoy creating simple but effective solutions to improve application performance, ease of maintenance, and user experience.
                </p>
              </motion.div>
              <motion.a 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ 
                  delay: 1,
                  duration: 0.5
                }}
                href="/resume.pdf" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium tracking-wide hover:shadow-lg transition-all duration-300"
              >
                Get My Resume
              </motion.a>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ 
                opacity: 1, 
                scale: [1, 1.1, 1.1, 1, 1],
                rotate: [0, 0, 5, 5, 0],
                borderRadius: ["8px", "8px", "50%", "50%", "8px"],
              }}
              transition={{ 
                duration: 3,
                ease: "easeInOut",
                times: [0, 0.2, 0.5, 0.8, 1],
                repeat: Infinity,
                repeatDelay: 1
              }}
              whileHover={{ 
                scale: 1.05,
                rotate: 2,
                transition: { duration: 0.2 }
              }}
              className="relative lg:w-1/3 mt-10 lg:mt-0 flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg blur-xl opacity-20"></div>
                <motion.img
                  src="/profile.png"
                  alt="Jay Shah"
                  width={300}
                  height={300}
                  className="rounded-lg shadow-2xl relative z-10 object-cover"
                  style={{
                    width: 300,
                    height: 300,
                  }}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="relative min-h-screen flex flex-col justify-center items-center p-8 bg-[#181a1b] snap-start">
          <div className="max-w-7xl mx-auto w-full">
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-white mb-10"
            >
              EXPERIENCE
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ThrivePix Experience */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="group relative border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-gray-700 p-6 bg-[#181a1b]"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Code size={24} className="text-green-400" />
                  <h4 className={`text-xl text-white`}>ThrivePix LLC (Remote)</h4>
                </div>
                <p className={`text-xl text-gray-400 mb-4`}>Software Engineer – Backend (Java) | June 2021 - July 2023</p>
                <div className={`text-gray-400 space-y-3 text-sm`}>
                  <p>Designed and built backend microservices using Java and Spring Boot; optimised data access with Hibernate, improving system performance by 25%.</p>
                  <p>Led CI/CD improvements via Jenkins and GitHub Actions; reduced deployment time by 30%.</p>
                  <p>Developed and executed over 150+ unit/integration tests using JUnit, Mockito, and Postman for REST APIs.</p>
                  <p>Collaborated cross-functionally with Product, QA, and DevOps in an Agile/Scrum environment.</p>
                  <p>Oversaw technology management for backend services, ensuring system uptime and deployment efficiency.</p>
                </div>
              </motion.div>

              {/* University Experience */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="group relative border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-gray-700 p-6 bg-[#181a1b]"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Code size={24} className="text-green-400" />
                  <h4 className={`text-xl text-white`}>Student Manager, Roesch Library</h4>
                </div>
                <p className={`text-xl text-gray-400 mb-4`}>University of Dayton | April 2024 - Current</p>
                <div className={`text-gray-400 space-y-3 text-sm`}>
                  <p>Provided technical and printer support to 200+ students and faculty across 68 departments.</p>
                  <p>Assisted with system troubleshooting, debugging, and user experience enhancement across platforms.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Open Source Contributions */}
        <section id="contributions" className="relative min-h-screen flex flex-col justify-center items-center p-8 bg-[#181a1b] snap-start">
          <div className="max-w-7xl mx-auto w-full">
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-white mb-10"
            >
              CONTRIBUTIONS
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Java Pathfinder */}
              <div className="group relative border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Code size={24} className="text-green-400" />
                    <h4 className={`text-xl text-white`}>JAVA PATHFINDER</h4>
                  </div>
                  <p className={`text-gray-400 text-sm mb-4`}>
                    Enhanced regex pattern matching and implemented BDD testing in the JPCORE module.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300">Java</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300">Regex</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300">BDD</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300">Testing</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Code size={16} /> Java
                      </span>
                      <span className="flex items-center gap-1">
                        <Github size={16} /> 5
                      </span>
                    </div>
                    <a href="#" className="text-green-400 hover:text-green-300 transition-colors">
                      View Contribution <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Jenkins Tekton */}
              <div className="group relative border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Code size={24} className="text-green-400" />
                    <h4 className={`text-xl text-white`}>JENKINS TEKTON CLIENT PLUGIN</h4>
                  </div>
                  <p className={`text-gray-400 text-sm mb-4`}>
                    Refactored code for better modularity and added comprehensive unit tests for cross-platform support.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300">Java</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300">Jenkins</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300">Testing</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300">DevOps</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Code size={16} /> Java
                      </span>
                      <span className="flex items-center gap-1">
                        <Github size={16} /> 3
                      </span>
                    </div>
                    <a href="#" className="text-green-400 hover:text-green-300 transition-colors">
                      View Contribution <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="relative min-h-screen flex flex-col justify-center items-center p-8 bg-[#181a1b] snap-start">
          <div className="max-w-7xl mx-auto w-full">
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-white mb-10"
            >
              PROJECTS
            </motion.h3>
            <Flipper flipKey={projects.map(p => p.title).join('')}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, index) => (
                  <ProjectCard key={index} {...project} />
                ))}
              </div>
            </Flipper>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="relative min-h-screen flex flex-col justify-center items-center p-8 bg-[#181a1b] snap-start">
          <div className="max-w-7xl mx-auto w-full">
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              CONTACT!
            </motion.h3>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p>
                Feel free to reach out if you want to build something together, have a question, or just want to connect.
              </p>
              <div className="space-y-4">
                <p>
                  Edison, NJ
                </p>
                <p>
                  (937)-414-7823
                </p>
                <a 
                  href="mailto:jayshah.jk.jk18@gmail.com" 
                  className="text-white text-xl hover:text-gray-300 transition-colors duration-300 inline-block"
                >
                  jayshah.jk.jk18@gmail.com
                </a>
              </div>
              <div className="flex justify-center space-x-8 pt-4">
                <a 
                  href="https://linkedin.com/in/jayshah018" 
                  className="text-white hover:text-gray-300 transition-colors duration-300 text-lg"
                >
                  LinkedIn
                </a>
                <a 
                  href="https://github.com/jayshah1819" 
                  className="text-white hover:text-gray-300 transition-colors duration-300 text-lg"
                >
                  GitHub
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <footer className="text-center text-gray-400 text-sm mt-20 mb-10">
          Handcrafted by Jay Shah © 2024.
        </footer>
      </div>

      {/* Add smooth scroll behavior to the entire page */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
          scroll-snap-type: y mandatory;
        }
        section {
          scroll-snap-align: start;
        }
      `}</style>
    </div>
  );
} 