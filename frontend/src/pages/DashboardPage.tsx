import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Dumbbell, Flame, Zap, Trophy, Droplets, TrendingUp,
  Plus, Apple, Scale, SmilePlus, BarChart3, Target,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useAuthStore } from "../stores/authStore";
import { apiGet, apiPost } from "../lib/api";
import StatCard from "../components/StatCard";
import GlassCard from "../components/GlassCard";
import ProgressRing from "../components/ProgressRing";
import toast from "react-hot-toast";

interface DashboardData {
  total_workouts: number;
  total_calories_burned: number;
  current_streak: number;
  level: number;
  xp: number;
  coins: number;
  workouts_this_week: number;
  avg_workout_duration: number;
  total_volume_kg: number;
  personal_records_count: number;
}

interface NutritionSummary {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_count: number;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
}

interface WaterData {
  total_ml: number;
  target_ml: number;
  logs: { amount_ml: number; logged_at: string }[];
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [nutrition, setNutrition] = useState<NutritionSummary | null>(null);
  const [water, setWater] = useState<WaterData | null>(null);
  const [weightData, setWeightData] = useState<{ date: string; weight: number }[]>([]);

  useEffect(() => {
    apiGet<DashboardData>("/api/dashboard").then(setDashboard).catch(() => {});
    apiGet<NutritionSummary>("/api/nutrition-summary").then(setNutrition).catch(() => {});
    apiGet<WaterData>("/api/water-today").then(setWater).catch(() => {});
    apiGet<{ metrics: { recorded_at: string; weight_kg: number }[] }>("/api/body-metrics?type=weight&limit=30")
      .then((d) => setWeightData(d.metrics?.map((m) => ({ date: m.recorded_at?.slice(5, 10) || "", weight: m.weight_kg })) || []))
      .catch(() => {});
  }, []);

  const addWater = async (ml: number) => {
    try {
      await apiPost("/api/water-logs", { amount_ml: ml });
      const w = await apiGet<WaterData>("/api/water-today");
      setWater(w);
      toast.success(`+${ml}ml`);
    } catch { /* ignore */ }
  };

  const calPct = nutrition ? Math.round((nutrition.total_calories / (nutrition.target_calories || 2000)) * 100) : 0;
  const waterPct = water ? Math.round((water.total_ml / (water.target_ml || 3000)) * 100) : 0;

  const weeklyData = [
    { day: "Mon", workouts: 1, calories: 450 },
    { day: "Tue", workouts: 0, calories: 0 },
    { day: "Wed", workouts: 1, calories: 520 },
    { day: "Thu", workouts: 1, calories: 380 },
    { day: "Fri", workouts: 0, calories: 0 },
    { day: "Sat", workouts: 1, calories: 600 },
    { day: "Sun", workouts: 0, calories: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {t("dashboard.welcome")}, {user?.full_name?.split(" ")[0] || user?.username || "Champion"} 👋
          </h1>
          <p className="text-gray-400 mt-1">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/20 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 font-bold">{dashboard?.current_streak || user?.streak || 0} {t("dashboard.days")}</span>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-bold">Lv.{dashboard?.level || user?.level || 1}</span>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Dumbbell} label={t("dashboard.totalWorkouts")} value={dashboard?.total_workouts || 0} color="text-cyan-400" gradient="bg-gradient-to-br from-cyan-500 to-blue-600" />
        <StatCard icon={Flame} label={t("dashboard.caloriesBurned")} value={dashboard?.total_calories_burned || 0} sub={t("common.kcal")} color="text-orange-400" gradient="bg-gradient-to-br from-orange-500 to-red-600" />
        <StatCard icon={Zap} label={t("dashboard.xp")} value={dashboard?.xp || user?.xp || 0} color="text-yellow-400" gradient="bg-gradient-to-br from-yellow-500 to-amber-600" />
        <StatCard icon={Target} label={t("dashboard.weeklyWorkouts")} value={`${dashboard?.workouts_this_week || 0}/7`} color="text-green-400" gradient="bg-gradient-to-br from-green-500 to-emerald-600" />
      </div>

      {/* Nutrition & Water */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nutrition Ring */}
        <GlassCard className="lg:col-span-2" glow="bg-cyan-500">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Apple className="w-5 h-5 text-green-400" /> {t("dashboard.todayNutrition")}
          </h3>
          <div className="flex flex-wrap items-center gap-8">
            <ProgressRing progress={calPct} size={140} color="stroke-cyan-400">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{nutrition?.total_calories || 0}</p>
                <p className="text-xs text-gray-400">{t("common.kcal")}</p>
              </div>
            </ProgressRing>
            <div className="flex-1 space-y-3">
              {[
                { label: t("dashboard.protein"), value: nutrition?.total_protein || 0, target: nutrition?.target_protein || 150, color: "bg-red-500" },
                { label: t("dashboard.carbs"), value: nutrition?.total_carbs || 0, target: nutrition?.target_carbs || 250, color: "bg-yellow-500" },
                { label: t("dashboard.fat"), value: nutrition?.total_fat || 0, target: nutrition?.target_fat || 70, color: "bg-blue-500" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{m.label}</span>
                    <span className="text-white">{Math.round(m.value)}/{m.target}{t("common.g")}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((m.value / m.target) * 100, 100)}%` }} className={`h-full rounded-full ${m.color}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Water Tracker */}
        <GlassCard glow="bg-blue-500">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-400" /> {t("dashboard.water")}
          </h3>
          <div className="flex flex-col items-center">
            <ProgressRing progress={waterPct} size={120} color="stroke-blue-400">
              <div className="text-center">
                <p className="text-xl font-bold text-white">{water?.total_ml || 0}</p>
                <p className="text-xs text-gray-400">{t("common.ml")}</p>
              </div>
            </ProgressRing>
            <p className="text-sm text-gray-400 mt-2">/ {water?.target_ml || 3000}{t("common.ml")}</p>
            <div className="flex gap-2 mt-4">
              {[250, 500].map((ml) => (
                <button key={ml} onClick={() => addWater(ml)} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm">
                  <Plus className="w-4 h-4" /> {ml}{t("common.ml")}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <GlassCard glow="bg-purple-500">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" /> {t("dashboard.workoutFrequency")}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
              <Area type="monotone" dataKey="calories" stroke="#06b6d4" fill="url(#colorCal)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Weight Trend */}
        <GlassCard glow="bg-green-500">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" /> {t("dashboard.weightTrend")}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightData.length > 0 ? weightData : [{ date: "No data", weight: 0 }]}>
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
              <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <GlassCard glow="bg-cyan-500">
        <h3 className="text-lg font-semibold text-white mb-4">{t("dashboard.quickActions")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Dumbbell, label: t("dashboard.logWorkout"), color: "from-cyan-500 to-blue-600", path: "/workouts" },
            { icon: Apple, label: t("dashboard.logMeal"), color: "from-green-500 to-emerald-600", path: "/nutrition" },
            { icon: Droplets, label: t("dashboard.logWater"), color: "from-blue-500 to-indigo-600", path: "#" },
            { icon: Scale, label: t("dashboard.logWeight"), color: "from-purple-500 to-pink-600", path: "/analytics" },
          ].map((action) => (
            <motion.a
              key={action.label}
              href={action.path}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${action.color} bg-opacity-20 hover:bg-opacity-30 transition-all cursor-pointer border border-white/5`}
            >
              <action.icon className="w-6 h-6 text-white" />
              <span className="text-sm text-white font-medium text-center">{action.label}</span>
            </motion.a>
          ))}
        </div>
      </GlassCard>

      {/* Mood Tracker */}
      <GlassCard glow="bg-pink-500">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <SmilePlus className="w-5 h-5 text-pink-400" /> {t("dashboard.moodTracker")}
        </h3>
        <div className="flex gap-3 flex-wrap">
          {[
            { emoji: "😊", label: "Happy", value: 5 },
            { emoji: "😐", label: "Neutral", value: 3 },
            { emoji: "😴", label: "Tired", value: 2 },
            { emoji: "💪", label: "Energized", value: 5 },
            { emoji: "😤", label: "Stressed", value: 1 },
          ].map((mood) => (
            <motion.button
              key={mood.label}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={async () => {
                try {
                  await apiPost("/api/mood-logs", { mood: mood.value, energy_level: mood.value, notes: mood.label });
                  toast.success(`Mood logged: ${mood.emoji}`);
                } catch { /* ignore */ }
              }}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-xs text-gray-400">{mood.label}</span>
            </motion.button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
