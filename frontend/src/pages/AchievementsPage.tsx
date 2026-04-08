import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Trophy, Lock, Star, Coins, Zap } from "lucide-react";
import { apiGet } from "../lib/api";
import GlassCard from "../components/GlassCard";

interface Achievement {
  id: number;
  name_en: string;
  name_ar: string;
  name_he: string;
  description_en: string;
  description_ar: string;
  description_he: string;
  icon: string;
  xp_reward: number;
  coin_reward: number;
  requirement_type: string;
  requirement_value: number;
  earned: boolean;
  earned_at?: string;
}

export default function AchievementsPage() {
  const { t, i18n } = useTranslation();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const langName = `name_${i18n.language}` as keyof Achievement;
  const langDesc = `description_${i18n.language}` as keyof Achievement;

  useEffect(() => {
    apiGet<{ earned: Achievement[]; locked: Achievement[] }>("/api/achievements/user")
      .then((d) => {
        const earned = (d.earned || []).map((a) => ({ ...a, earned: true }));
        const locked = (d.locked || []).map((a) => ({ ...a, earned: false }));
        setAchievements([...earned, ...locked]);
      })
      .catch(() => {
        apiGet<Achievement[]>("/api/achievements").then((all) => setAchievements(all.map((a) => ({ ...a, earned: false })))).catch(() => {});
      });
  }, []);

  const earnedCount = achievements.filter((a) => a.earned).length;

  const iconMap: Record<string, string> = {
    "first_workout": "🏋️", "streak_7": "🔥", "streak_30": "💪", "log_100": "📊",
    "social_post": "💬", "level_10": "⭐", "level_25": "🌟", "calories_10k": "🔥",
    "water_master": "💧", "early_bird": "🌅",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" /> {t("gamification.achievements")}
        </h1>
        <div className="px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/20">
          <span className="text-yellow-400 font-bold">{earnedCount}/{achievements.length}</span>
          <span className="text-gray-400 ml-1">{t("gamification.unlocked")}</span>
        </div>
      </div>

      {/* Progress */}
      <GlassCard glow="bg-yellow-500">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${achievements.length > 0 ? (earnedCount / achievements.length) * 100 : 0}%` }}
                className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
              />
            </div>
          </div>
          <span className="text-sm text-gray-400">{achievements.length > 0 ? Math.round((earnedCount / achievements.length) * 100) : 0}%</span>
        </div>
      </GlassCard>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((ach, i) => (
          <motion.div
            key={ach.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard
              className={`relative ${!ach.earned ? "opacity-60" : ""}`}
              hover
              glow={ach.earned ? "bg-yellow-500" : undefined}
            >
              {!ach.earned && (
                <div className="absolute top-3 right-3">
                  <Lock className="w-5 h-5 text-gray-500" />
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                  ach.earned
                    ? "bg-gradient-to-br from-yellow-500 to-amber-600 shadow-lg shadow-yellow-500/20"
                    : "bg-white/5"
                }`}>
                  {iconMap[ach.icon] || "🏆"}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{(ach[langName] as string) || ach.name_en}</h3>
                  <p className="text-sm text-gray-400 mt-1">{(ach[langDesc] as string) || ach.description_en}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-yellow-400">
                      <Zap className="w-3 h-3" /> {ach.xp_reward} XP
                    </span>
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      <Coins className="w-3 h-3" /> {ach.coin_reward}
                    </span>
                  </div>
                  {ach.earned && ach.earned_at && (
                    <p className="text-xs text-green-400 mt-1">
                      Earned {new Date(ach.earned_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {achievements.length === 0 && (
        <GlassCard className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Start working out to earn achievements!</p>
        </GlassCard>
      )}
    </div>
  );
}
