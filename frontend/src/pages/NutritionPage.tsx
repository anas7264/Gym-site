import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Apple, Plus, Search, Droplets, Timer, Calculator,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { apiGet, apiPost } from "../lib/api";
import GlassCard from "../components/GlassCard";
import ProgressRing from "../components/ProgressRing";
import toast from "react-hot-toast";

interface Food {
  id: number;
  name_en: string;
  name_ar: string;
  name_he: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  is_halal: boolean;
  is_kosher: boolean;
  is_vegan: boolean;
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

export default function NutritionPage() {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<"summary" | "log" | "foods" | "water" | "tdee" | "fasting">("summary");
  const [summary, setSummary] = useState<NutritionSummary | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [amount, setAmount] = useState("100");
  const [mealType, setMealType] = useState("lunch");
  const [tdeeForm, setTdeeForm] = useState({ weight_kg: 70, height_cm: 175, age: 25, gender: "male", activity_level: "moderate", formula: "mifflin" });
  const [tdeeResult, setTdeeResult] = useState<{ tdee: number; bmr: number; macros: Record<string, Record<string, number>> } | null>(null);
  const [fastingHours, setFastingHours] = useState(16);
  const [fastingActive, setFastingActive] = useState(false);
  const [fastingTime, setFastingTime] = useState(0);

  const langKey = `name_${i18n.language}` as keyof Food;

  useEffect(() => {
    apiGet<NutritionSummary>("/api/nutrition-summary").then(setSummary).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === "foods") {
      apiGet<Food[]>(`/api/foods?search=${search}`).then(setFoods).catch(() => {});
    }
  }, [tab, search]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (fastingActive) {
      interval = setInterval(() => setFastingTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [fastingActive]);

  const logMeal = async () => {
    if (!selectedFood) return;
    try {
      const g = parseFloat(amount);
      await apiPost("/api/meal-logs", {
        food_id: selectedFood.id,
        quantity_grams: g,
        meal_type: mealType,
        calories: (selectedFood.calories_per_100g * g) / 100,
        protein: (selectedFood.protein_per_100g * g) / 100,
        carbs: (selectedFood.carbs_per_100g * g) / 100,
        fat: (selectedFood.fat_per_100g * g) / 100,
      });
      toast.success("Meal logged!");
      setSelectedFood(null);
      const s = await apiGet<NutritionSummary>("/api/nutrition-summary");
      setSummary(s);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const calculateTDEE = async () => {
    try {
      const res = await apiPost<{ tdee: number; bmr: number; macros: Record<string, Record<string, number>> }>("/api/calculate-tdee", tdeeForm);
      setTdeeResult(res);
    } catch { toast.error("Calculation failed"); }
  };

  const macroData = summary ? [
    { name: t("dashboard.protein"), value: Math.round(summary.total_protein), color: "#ef4444" },
    { name: t("dashboard.carbs"), value: Math.round(summary.total_carbs), color: "#eab308" },
    { name: t("dashboard.fat"), value: Math.round(summary.total_fat), color: "#3b82f6" },
  ] : [];

  const calPct = summary ? Math.round((summary.total_calories / (summary.target_calories || 2000)) * 100) : 0;

  const tabs = [
    { key: "summary" as const, label: t("nutrition.dailySummary"), icon: Apple },
    { key: "log" as const, label: t("nutrition.logMeal"), icon: Plus },
    { key: "foods" as const, label: t("nutrition.foodDatabase"), icon: Search },
    { key: "water" as const, label: t("nutrition.waterTracker"), icon: Droplets },
    { key: "tdee" as const, label: t("nutrition.tdeeCalculator"), icon: Calculator },
    { key: "fasting" as const, label: t("nutrition.fastingTimer"), icon: Timer },
  ];

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <Apple className="w-8 h-8 text-green-400" /> {t("nav.nutrition")}
      </h1>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tb) => (
          <button key={tb.key} onClick={() => setTab(tb.key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === tb.key ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"}`}>
            <tb.icon className="w-4 h-4" /> {tb.label}
          </button>
        ))}
      </div>

      {tab === "summary" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard glow="bg-green-500">
            <h3 className="text-xl font-bold text-white mb-6">{t("nutrition.calorieBalance")}</h3>
            <div className="flex items-center justify-center gap-8">
              <ProgressRing progress={calPct} size={160} color="stroke-green-400">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{summary?.total_calories || 0}</p>
                  <p className="text-xs text-gray-400">/ {summary?.target_calories || 2000}</p>
                </div>
              </ProgressRing>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{summary?.target_calories ? summary.target_calories - summary.total_calories : 0}</p>
                  <p className="text-sm text-gray-400">{t("nutrition.remaining")}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{summary?.meal_count || 0}</p>
                  <p className="text-sm text-gray-400">Meals</p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard glow="bg-blue-500">
            <h3 className="text-xl font-bold text-white mb-6">{t("nutrition.macroSplit")}</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie data={macroData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={5}>
                    {macroData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {macroData.map((m) => (
                  <div key={m.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                      <span className="text-sm text-gray-300">{m.name}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{m.value}g</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {tab === "log" && (
        <GlassCard glow="bg-green-500">
          <h3 className="text-xl font-bold text-white mb-4">{t("nutrition.logMeal")}</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Meal Type</label>
              <div className="flex gap-2 mt-2">
                {["breakfast", "lunch", "dinner", "snack"].map((m) => (
                  <button key={m} onClick={() => setMealType(m)} className={`px-4 py-2 rounded-xl text-sm capitalize ${mealType === m ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/5 text-gray-400"}`}>
                    {t(`nutrition.${m}`)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400">{t("common.search")} Food</label>
              <input value={search} onChange={(e) => { setSearch(e.target.value); setTab("log"); apiGet<Food[]>(`/api/foods?search=${e.target.value}`).then(setFoods).catch(() => {}); }} placeholder="Search foods..." className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50" />
            </div>
            {foods.length > 0 && !selectedFood && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {foods.slice(0, 10).map((food) => (
                  <button key={food.id} onClick={() => setSelectedFood(food)} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left">
                    <div>
                      <p className="text-white">{(food[langKey] as string) || food.name_en}</p>
                      <p className="text-xs text-gray-400">{food.calories_per_100g} kcal/100g • P:{food.protein_per_100g}g C:{food.carbs_per_100g}g F:{food.fat_per_100g}g</p>
                    </div>
                    <Plus className="w-4 h-4 text-green-400" />
                  </button>
                ))}
              </div>
            )}
            {selectedFood && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 space-y-3">
                <p className="font-semibold text-white">{(selectedFood[langKey] as string) || selectedFood.name_en}</p>
                <div>
                  <label className="text-sm text-gray-400">Amount (grams)</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white" />
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div><p className="text-gray-400">Calories</p><p className="font-bold text-white">{Math.round(selectedFood.calories_per_100g * parseFloat(amount || "0") / 100)}</p></div>
                  <div><p className="text-gray-400">Protein</p><p className="font-bold text-red-400">{Math.round(selectedFood.protein_per_100g * parseFloat(amount || "0") / 100)}g</p></div>
                  <div><p className="text-gray-400">Carbs</p><p className="font-bold text-yellow-400">{Math.round(selectedFood.carbs_per_100g * parseFloat(amount || "0") / 100)}g</p></div>
                  <div><p className="text-gray-400">Fat</p><p className="font-bold text-blue-400">{Math.round(selectedFood.fat_per_100g * parseFloat(amount || "0") / 100)}g</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={logMeal} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold">Log Meal</button>
                  <button onClick={() => setSelectedFood(null)} className="px-4 py-2 rounded-xl bg-white/10 text-gray-300">{t("common.cancel")}</button>
                </div>
              </motion.div>
            )}
          </div>
        </GlassCard>
      )}

      {tab === "foods" && (
        <GlassCard glow="bg-green-500">
          <h3 className="text-xl font-bold text-white mb-4">{t("nutrition.foodDatabase")}</h3>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("common.search")} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 mb-4" />
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {foods.map((food) => (
              <div key={food.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <p className="text-white font-medium">{(food[langKey] as string) || food.name_en}</p>
                  <div className="flex gap-2 mt-1">
                    {food.is_halal && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Halal</span>}
                    {food.is_kosher && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">Kosher</span>}
                    {food.is_vegan && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">Vegan</span>}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="text-white font-bold">{food.calories_per_100g} kcal</p>
                  <p className="text-gray-400">P:{food.protein_per_100g} C:{food.carbs_per_100g} F:{food.fat_per_100g}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {tab === "water" && (
        <GlassCard glow="bg-blue-500">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Droplets className="w-6 h-6 text-blue-400" /> {t("nutrition.waterTracker")}
          </h3>
          <div className="text-center space-y-6">
            <ProgressRing progress={0} size={180} color="stroke-blue-400">
              <div>
                <p className="text-3xl font-bold text-white">0</p>
                <p className="text-sm text-gray-400">/ 3000 ml</p>
              </div>
            </ProgressRing>
            <div className="flex gap-3 justify-center flex-wrap">
              {[150, 250, 330, 500, 750].map((ml) => (
                <motion.button key={ml} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={async () => {
                  try { await apiPost("/api/water-logs", { amount_ml: ml }); toast.success(`+${ml}ml`); } catch {}
                }} className="px-6 py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors font-medium">
                  <Droplets className="w-5 h-5 mx-auto mb-1" /> {ml}ml
                </motion.button>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {tab === "tdee" && (
        <GlassCard glow="bg-orange-500">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-orange-400" /> {t("nutrition.tdeeCalculator")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "weight_kg", label: "Weight (kg)", type: "number" },
              { key: "height_cm", label: "Height (cm)", type: "number" },
              { key: "age", label: "Age", type: "number" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-sm text-gray-400">{f.label}</label>
                <input type={f.type} value={(tdeeForm as Record<string, unknown>)[f.key] as string} onChange={(e) => setTdeeForm({ ...tdeeForm, [f.key]: parseFloat(e.target.value) })} className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white" />
              </div>
            ))}
            <div>
              <label className="text-sm text-gray-400">Gender</label>
              <select value={tdeeForm.gender} onChange={(e) => setTdeeForm({ ...tdeeForm, gender: e.target.value })} className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Activity Level</label>
              <select value={tdeeForm.activity_level} onChange={(e) => setTdeeForm({ ...tdeeForm, activity_level: e.target.value })} className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white">
                <option value="sedentary">Sedentary</option>
                <option value="light">Lightly Active</option>
                <option value="moderate">Moderately Active</option>
                <option value="active">Very Active</option>
                <option value="very_active">Extremely Active</option>
              </select>
            </div>
          </div>
          <button onClick={calculateTDEE} className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold">Calculate TDEE</button>
          {tdeeResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
                <p className="text-sm text-gray-400">BMR</p>
                <p className="text-3xl font-bold text-orange-400">{Math.round(tdeeResult.bmr)}</p>
                <p className="text-xs text-gray-400">kcal/day</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                <p className="text-sm text-gray-400">TDEE</p>
                <p className="text-3xl font-bold text-red-400">{Math.round(tdeeResult.tdee)}</p>
                <p className="text-xs text-gray-400">kcal/day</p>
              </div>
            </motion.div>
          )}
        </GlassCard>
      )}

      {tab === "fasting" && (
        <GlassCard glow="bg-purple-500">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Timer className="w-5 h-5 text-purple-400" /> {t("nutrition.fastingTimer")}
          </h3>
          <div className="text-center space-y-6">
            <div className="flex gap-3 justify-center">
              {[16, 18, 20, 24].map((h) => (
                <button key={h} onClick={() => setFastingHours(h)} className={`px-4 py-2 rounded-xl text-sm font-medium ${fastingHours === h ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-white/5 text-gray-400"}`}>
                  {h}:{24 - h}
                </button>
              ))}
            </div>
            <ProgressRing progress={fastingActive ? (fastingTime / (fastingHours * 3600)) * 100 : 0} size={200} color="stroke-purple-400">
              <div>
                <p className="text-3xl font-mono font-bold text-white">{formatTime(fastingActive ? fastingTime : 0)}</p>
                <p className="text-sm text-gray-400">/ {fastingHours}h</p>
              </div>
            </ProgressRing>
            <button onClick={() => { setFastingActive(!fastingActive); if (!fastingActive) setFastingTime(0); }} className={`px-8 py-3 rounded-xl font-semibold ${fastingActive ? "bg-red-500/20 text-red-400" : "bg-gradient-to-r from-purple-500 to-pink-600 text-white"}`}>
              {fastingActive ? "End Fast" : "Start Fast"}
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
