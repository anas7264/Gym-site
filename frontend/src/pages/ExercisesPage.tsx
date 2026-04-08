import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Target, Search, Filter, Dumbbell } from "lucide-react";
import { apiGet } from "../lib/api";
import GlassCard from "../components/GlassCard";

interface Exercise {
  id: number;
  name_en: string;
  name_ar: string;
  name_he: string;
  category: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  description_en: string;
  description_ar: string;
  description_he: string;
  instructions_en: string;
}

export default function ExercisesPage() {
  const { t, i18n } = useTranslation();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [muscle, setMuscle] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [selected, setSelected] = useState<Exercise | null>(null);
  const langKey = `name_${i18n.language}` as keyof Exercise;
  const descKey = `description_${i18n.language}` as keyof Exercise;

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (muscle) params.set("muscle_group", muscle);
    if (difficulty) params.set("difficulty", difficulty);
    apiGet<Exercise[]>(`/api/exercises?${params}`).then(setExercises).catch(() => {});
  }, [search, category, muscle, difficulty]);

  const categories = ["strength", "cardio", "flexibility", "bodyweight", "olympic", "powerlifting"];
  const muscles = ["chest", "back", "shoulders", "biceps", "triceps", "legs", "core", "glutes", "full_body"];
  const difficulties = ["beginner", "intermediate", "advanced"];

  const diffColor = (d: string) => {
    if (d === "beginner") return "text-green-400 bg-green-500/20";
    if (d === "intermediate") return "text-yellow-400 bg-yellow-500/20";
    return "text-red-400 bg-red-500/20";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <Target className="w-8 h-8 text-cyan-400" /> {t("nav.exercises")}
      </h1>

      {/* Search & Filters */}
      <GlassCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("common.search")} className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={muscle} onChange={(e) => setMuscle(e.target.value)} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm">
            <option value="">All Muscles</option>
            {muscles.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm">
            <option value="">All Levels</option>
            {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </GlassCard>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercises.map((ex, i) => (
          <motion.div key={ex.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.02, y: -4 }} onClick={() => setSelected(ex)} className="cursor-pointer">
            <GlassCard hover>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${diffColor(ex.difficulty)}`}>{ex.difficulty}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{(ex[langKey] as string) || ex.name_en}</h3>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{(ex[descKey] as string) || ex.description_en || ""}</p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">{ex.category}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">{ex.muscle_group}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">{ex.equipment}</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {exercises.length === 0 && (
        <GlassCard className="text-center py-12">
          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">{t("common.noData")}</p>
        </GlassCard>
      )}

      {/* Exercise Detail Modal */}
      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{(selected[langKey] as string) || selected.name_en}</h3>
                <p className="text-sm text-gray-400">{selected.category} • {selected.muscle_group}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <span className={`text-xs px-3 py-1 rounded-full ${diffColor(selected.difficulty)}`}>{selected.difficulty}</span>
                <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-400">{selected.equipment}</span>
              </div>
              {((selected[descKey] as string) || selected.description_en) && (
                <p className="text-gray-300 text-sm">{(selected[descKey] as string) || selected.description_en}</p>
              )}
              {selected.instructions_en && (
                <div>
                  <p className="text-sm font-medium text-white mb-1">Instructions</p>
                  <p className="text-sm text-gray-400">{selected.instructions_en}</p>
                </div>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="w-full mt-4 py-2 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20">{t("common.close")}</button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
