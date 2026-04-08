import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  gradient: string;
}

export default function StatCard({ icon: Icon, label, value, sub, color, gradient }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 overflow-hidden group"
    >
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${gradient}`} />
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center mb-3`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400 mt-1">{label}</p>
        {sub && <p className={`text-xs mt-1 ${color}`}>{sub}</p>}
      </div>
    </motion.div>
  );
}
