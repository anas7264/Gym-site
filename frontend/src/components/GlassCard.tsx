import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: string;
  onClick?: () => void;
}

export default function GlassCard({ children, className = "", hover = false, glow, onClick }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      onClick={onClick}
      className={`relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 overflow-hidden ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {glow && (
        <div
          className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${glow}`}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
