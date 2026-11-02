"use client";

import React, { useEffect, useState } from "react";

interface FadeInCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export default function FadeInCard({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: FadeInCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getDirectionClasses = () => {
    if (isVisible) {
      return "opacity-100 translate-y-0 translate-x-0 scale-100";
    }
    switch (direction) {
      case "up":
        return "opacity-0 translate-y-6 scale-[0.98]";
      case "down":
        return "opacity-0 -translate-y-6 scale-[0.98]";
      case "left":
        return "opacity-0 translate-x-6 scale-[0.98]";
      case "right":
        return "opacity-0 -translate-x-6 scale-[0.98]";
      default:
        return "opacity-0 scale-[0.98]";
    }
  };

  return (
    <div
      className={`transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) transform ${getDirectionClasses()} ${className}`}
    >
      {children}
    </div>
  );
}
