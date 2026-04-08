import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell, Plus, Play, Clock, Flame, Trophy, Calculator,
  ChevronDown, ChevronUp, Trash2, Sparkles, Timer,
} from "lucide-react";
import { apiGet, apiPost } from "../lib/api";
import GlassCard from "../components/GlassCard";
import toast from "react-hot-toast";

interface Exercise {
  id: number;
  name_en: string;
  name_ar: string;
  name_he: string;
  category: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
}

interface WorkoutSet {
  exercise_id: number;
  exercise_name: string;
  sets: { reps: number; weight_kg: number; completed: boolean }[];
}

export default function WorkoutsPage() {
  const { t, i18n } = useTranslation();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutSets, setWorkoutSets] = useState<WorkoutSet[]>([]);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [showExercises, setShowExercises] = useState(false);
  const [filter, setFilter] = useState({ category: "", muscle_group: "", search: "" });
  const [tab, setTab] = useState<"log" | "plans" | "prs" | "tools">("log");
  const [rmWeight, setRmWeight] = useState("");
  const [rmReps, setRmReps] = useState("");
  const [rmResult, setRmResult] = useState<number | null>(null);
  const [restTimer, setRestTimer] = useState(0);
  const [restActive, setRestActive] = useState(false);

  const langKey = `name_${i18n.language}` as keyof Exercise;

  useEffect(() => {
    apiGet<Exercise[]>("/api/exercises").then(setExercises).catch(() => {});
  }, []);

  // Workout timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isWorkoutActive) {
      interval = setInterval(() => setWorkoutTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive]);

  // Rest timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (restActive && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((t) => {
          if (t <= 1) { setRestActive(false); toast.success("Rest complete!"); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restActive, restTimer]);

  const addExercise = (ex: Exercise) => {
    setWorkoutSets([...workoutSets, {
      exercise_id: ex.id,
      exercise_name: (ex[langKey] as string) || ex.name_en,
      sets: [{ reps: 10, weight_kg: 20, completed: false }],
    }]);
    setShowExercises(false);
  };

  const addSet = (idx: number) => {
    const updated = [...workoutSets];
    const lastSet = updated[idx].sets[updated[idx].sets.length - 1];
    updated[idx].sets.push({ ...lastSet, completed: false });
    setWorkoutSets(updated);
  };

  const updateSet = (exIdx: number, setIdx: number, field: string, value: number) => {
    const updated = [...workoutSets];
    (updated[exIdx].sets[setIdx] as Record<string, unknown>)[field] = value;
    setWorkoutSets(updated);
  };

  const toggleComplete = (exIdx: number, setIdx: number) => {
    const updated = [...workoutSets];
    updated[exIdx].sets[setIdx].completed = !updated[exIdx].sets[setIdx].completed;
    setWorkoutSets(updated);
    if (updated[exIdx].sets[setIdx].completed) {
      setRestTimer(90);
      setRestActive(true);
    }
  };

  const removeExercise = (idx: number) => {
    setWorkoutSets(workoutSets.filter((_, i) => i !== idx));
  };

  const finishWorkout = async () => {
    if (workoutSets.length === 0) return;
    try {
      const sets = workoutSets.flatMap((ws) =>
        ws.sets.filter((s) => s.completed).map((s, i) => ({
          exercise_id: ws.exercise_id,
          set_number: i + 1,
          reps: s.reps,
          weight_kg: s.weight_kg,
          set_type: "working",
        }))
      );
      await apiPost("/api/workouts", {
        name: "Workout Session",
        duration_minutes: Math.round(workoutTime / 60),
        calories_burned: Math.round(workoutTime / 60 * 8),
        sets,
      });
      toast.success("Workout saved!");
      setIsWorkoutActive(false);
      setWorkoutSets([]);
      setWorkoutTime(0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save workout");
    }
  };

  const calculate1RM = async () => {
    try {
      const res = await apiPost<{ estimated_1rm: Record<string, number> }>("/api/calculate-1rm", {
        weight: parseFloat(rmWeight), reps: parseInt(rmReps),
      });
      setRmResult(Math.round(Object.values(res.estimated_1rm)[0]));
    } catch { toast.error("Calculation failed"); }
  };

  const filteredExercises = exercises.filter((ex) => {
    if (filter.category && ex.category !== filter.category) return false;
    if (filter.muscle_group && ex.muscle_group !== filter.muscle_group) return false;
    if (filter.search) {
      const name = ((ex[langKey] as string) || ex.name_en).toLowerCase();
      if (!name.includes(filter.search.toLowerCase())) return false;
    }
    return true;
  });

  const categories = [...new Set(exercises.map((e) => e.category))];
  const muscleGroups = [...new Set(exercises.map((e) => e.muscle_group))];

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const tabs = [
    { key: "log" as const, label: t("workouts.logWorkout"), icon: Play },
    { key: "plans" as const, label: t("workouts.myPlans"), icon: Dumbbell },
    { key: "prs" as const, label: t("workouts.personalRecords"), icon: Trophy },
    { key: "tools" as const, label: t("workouts.oneRmCalculator"), icon: Calculator },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <Dumbbell className="w-8 h-8 text-cyan-400" /> {t("nav.workouts")}
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              tab === tb.key ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <tb.icon className="w-4 h-4" /> {tb.label}
          </button>
        ))}
      </div>

      {tab === "log" && (
        <>
          {/* Workout Controls */}
          <GlassCard glow="bg-cyan-500">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-mono font-bold text-white">{formatTime(workoutTime)}</p>
                  <p className="text-xs text-gray-400">{t("workouts.duration")}</p>
                </div>
                {restActive && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/20">
                    <p className="text-xl font-mono font-bold text-orange-400">{formatTime(restTimer)}</p>
                    <p className="text-xs text-orange-400/60">{t("workouts.rest")}</p>
                  </motion.div>
                )}
              </div>
              <div className="flex gap-2">
                {!isWorkoutActive ? (
                  <button onClick={() => setIsWorkoutActive(true)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all">
                    <Play className="w-5 h-5" /> {t("workouts.startWorkout")}
                  </button>
                ) : (
                  <>
                    <button onClick={() => setShowExercises(true)} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
                      <Plus className="w-5 h-5" /> {t("workouts.addExercise")}
                    </button>
                    <button onClick={finishWorkout} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-400 hover:to-emerald-500 transition-all">
                      {t("workouts.finishWorkout")}
                    </button>
                  </>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Exercise Selector Modal */}
          <AnimatePresence>
            {showExercises && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowExercises(false)}>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="w-full max-w-2xl max-h-[80vh] rounded-2xl border border-white/10 bg-gray-900 backdrop-blur-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6 border-b border-white/5">
                    <h3 className="text-xl font-bold text-white mb-4">{t("workouts.exercises")}</h3>
                    <input value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} placeholder={t("common.search")} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300">
                        <option value="">All Categories</option>
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select value={filter.muscle_group} onChange={(e) => setFilter({ ...filter, muscle_group: e.target.value })} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300">
                        <option value="">All Muscles</option>
                        {muscleGroups.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-96 p-4 space-y-2">
                    {filteredExercises.map((ex) => (
                      <button key={ex.id} onClick={() => addExercise(ex)} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left">
                        <div>
                          <p className="text-white font-medium">{(ex[langKey] as string) || ex.name_en}</p>
                          <p className="text-xs text-gray-400">{ex.muscle_group} • {ex.equipment} • {ex.difficulty}</p>
                        </div>
                        <Plus className="w-5 h-5 text-cyan-400" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Workout Sets */}
          <div className="space-y-4">
            {workoutSets.map((ws, exIdx) => (
              <GlassCard key={exIdx}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">{ws.exercise_name}</h4>
                  <button onClick={() => removeExercise(exIdx)} className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 px-2">
                    <span className="col-span-1">#</span>
                    <span className="col-span-3">{t("workouts.weight")} (kg)</span>
                    <span className="col-span-3">{t("workouts.reps")}</span>
                    <span className="col-span-3"></span>
                    <span className="col-span-2"></span>
                  </div>
                  {ws.sets.map((set, setIdx) => (
                    <motion.div key={setIdx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl ${set.completed ? "bg-green-500/10 border border-green-500/20" : "bg-white/5"}`}>
                      <span className="col-span-1 text-sm text-gray-400">{setIdx + 1}</span>
                      <input type="number" value={set.weight_kg} onChange={(e) => updateSet(exIdx, setIdx, "weight_kg", parseFloat(e.target.value) || 0)} className="col-span-3 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm text-center" />
                      <input type="number" value={set.reps} onChange={(e) => updateSet(exIdx, setIdx, "reps", parseInt(e.target.value) || 0)} className="col-span-3 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm text-center" />
                      <div className="col-span-3"></div>
                      <button onClick={() => toggleComplete(exIdx, setIdx)} className={`col-span-2 py-1.5 rounded-lg text-sm font-medium transition-all ${set.completed ? "bg-green-500/20 text-green-400" : "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"}`}>
                        {set.completed ? "Done" : "Log"}
                      </button>
                    </motion.div>
                  ))}
                </div>
                <button onClick={() => addSet(exIdx)} className="mt-3 flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                  <Plus className="w-4 h-4" /> {t("workouts.addSet")}
                </button>
              </GlassCard>
            ))}
          </div>

          {workoutSets.length === 0 && !isWorkoutActive && (
            <GlassCard className="text-center py-12">
              <Dumbbell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">{t("workouts.noWorkouts")}</p>
            </GlassCard>
          )}
        </>
      )}

      {tab === "plans" && (
        <GlassCard glow="bg-purple-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">{t("workouts.myPlans")}</h3>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium">
              <Sparkles className="w-4 h-4" /> {t("workouts.generateAI")}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["Push Day", "Pull Day", "Leg Day", "Upper Body", "Full Body", "HIIT Circuit"].map((plan, i) => (
              <motion.div key={plan} whileHover={{ scale: 1.02 }} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">{plan}</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400">{3 + i} exercises</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{45 + i * 5} min • {["Chest, Shoulders, Triceps", "Back, Biceps", "Quads, Hamstrings, Glutes", "Chest, Back, Shoulders", "Full Body Compound", "Cardio, Core"][i]}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {tab === "prs" && (
        <GlassCard glow="bg-yellow-500">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" /> {t("workouts.personalRecords")}
          </h3>
          <div className="space-y-3">
            {["Bench Press", "Squat", "Deadlift", "Overhead Press", "Barbell Row"].map((ex, i) => (
              <div key={ex} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="font-semibold text-white">{ex}</p>
                  <p className="text-sm text-gray-400">Last PR: {["2 weeks ago", "1 week ago", "3 days ago", "5 days ago", "1 month ago"][i]}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-400">{[100, 140, 180, 60, 80][i]} kg</p>
                  <p className="text-xs text-gray-400">1RM</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {tab === "tools" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1RM Calculator */}
          <GlassCard glow="bg-cyan-500">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-400" /> {t("workouts.oneRmCalculator")}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">{t("workouts.weight")} (kg)</label>
                <input type="number" value={rmWeight} onChange={(e) => setRmWeight(e.target.value)} className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400">{t("workouts.reps")}</label>
                <input type="number" value={rmReps} onChange={(e) => setRmReps(e.target.value)} className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white" />
              </div>
              <button onClick={calculate1RM} className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold">Calculate</button>
              {rmResult && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <p className="text-sm text-gray-400">Estimated 1RM</p>
                  <p className="text-4xl font-bold text-cyan-400">{rmResult} kg</p>
                </motion.div>
              )}
            </div>
          </GlassCard>

          {/* Rest Timer */}
          <GlassCard glow="bg-orange-500">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Timer className="w-5 h-5 text-orange-400" /> {t("workouts.restTimer")}
            </h3>
            <div className="text-center">
              <p className="text-6xl font-mono font-bold text-white mb-6">{formatTime(restTimer)}</p>
              <div className="flex gap-2 justify-center flex-wrap mb-4">
                {[30, 60, 90, 120, 180].map((s) => (
                  <button key={s} onClick={() => { setRestTimer(s); setRestActive(true); }} className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-orange-500/20 hover:text-orange-400 transition-all text-sm">
                    {s}s
                  </button>
                ))}
              </div>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setRestActive(!restActive)} className={`px-6 py-2 rounded-xl font-medium ${restActive ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                  {restActive ? "Pause" : "Start"}
                </button>
                <button onClick={() => { setRestTimer(0); setRestActive(false); }} className="px-6 py-2 rounded-xl bg-white/10 text-gray-300">Reset</button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
