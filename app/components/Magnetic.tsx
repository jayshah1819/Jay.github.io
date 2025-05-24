"use client";

import { useRef } from "react";

export default function Magnetic({ children }: { children: React.ReactNode }) {
  const areaRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const item = areaRef.current?.querySelector(".hover-target") as HTMLElement;
    if (!item || !areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    item.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  };

  const handleMouseLeave = () => {
    const item = areaRef.current?.querySelector(".hover-target") as HTMLElement;
    if (item) item.style.transform = "translate(0px, 0px)";
  };

  return (
    <div
      className="magnetic-area"
      ref={areaRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="hover-target">{children}</div>
    </div>
  );
}
