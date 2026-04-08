import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Target, Users, Calendar, Zap, Coins, Clock } from "lucide-react";
import { apiGet } from "../lib/api";
import GlassCard from "../components/GlassCard";
import ProgressRing from "../components/ProgressRing";

interface Challenge {
  id: number;
  name_en: string;
  name_ar: string;
  name_he: string;
  description_en: string;
  description_ar: string;
  description_he: string;
  challenge_type: string;
  duration_days: number;
  xp_reward: number;
  coin_reward: number;
  target_value: number;
  participants_count: number;
  start_date: string;
  end_date: string;
}

export default function ChallengesPage() {
  const { t, i18n } = useTranslation();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const langName = `name_${i18n.language}` as keyof Challenge;
  const langDesc = `description_${i18n.language}` as keyof Challenge;

  useEffect(() => {
    apiGet<Challenge[]>("/api/challenges").then(setChallenges).catch(() => {});
  }, []);

  const typeColors: Record<string, string> = {
    workout: "from-cyan-500 to-blue-600",
    streak: "from-orange-500 to-red-600",
    nutrition: "from-green-500 to-emerald-600",
    community: "from-purple-500 to-pink-600",
    special: "from-yellow-500 to-amber-600",
  };

  const typeIcons: Record<string, string> = {
    workout: "💪", streak: "🔥", nutrition: "🥗", community: "👥", special: "⭐",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <Target className="w-8 h-8 text-orange-400" /> {t("gamification.challenges")}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((ch, i) => {
          const daysLeft = Math.max(0, Math.ceil((new Date(ch.end_date).getTime() - Date.now()) / 86400000));
          const totalDays = ch.duration_days || 30;
          const progress = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100));
          const gradient = typeColors[ch.challenge_type] || "from-gray-500 to-gray-600";

          return (
            <motion.div key={ch.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard hover glow={`bg-gradient-to-br ${gradient}`}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{typeIcons[ch.challenge_type] || "🎯"}</span>
                  <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${gradient} text-white capitalize`}>
                    {ch.challenge_type}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{(ch[langName] as string) || ch.name_en}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{(ch[langDesc] as string) || ch.description_en}</p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{t("gamification.progress")}</span>
                    <span className="text-white">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={`h-full rounded-full bg-gradient-to-r ${gradient}`} />
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-3 h-3" /> {daysLeft}d left
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Users className="w-3 h-3" /> {ch.participants_count}
                    </span>
                  </div>
                </div>

                {/* Rewards */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                  <span className="flex items-center gap-1 text-xs text-yellow-400">
                    <Zap className="w-3 h-3" /> {ch.xp_reward} XP
                  </span>
                  <span className="flex items-center gap-1 text-xs text-amber-400">
                    <Coins className="w-3 h-3" /> {ch.coin_reward}
                  </span>
                </div>

                <button className={`w-full mt-4 py-2 rounded-xl bg-gradient-to-r ${gradient} text-white text-sm font-medium hover:opacity-90 transition-opacity`}>
                  Join Challenge
                </button>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {challenges.length === 0 && (
        <GlassCard className="text-center py-12">
          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No active challenges. Check back soon!</p>
        </GlassCard>
      )}
    </div>
  );
}
