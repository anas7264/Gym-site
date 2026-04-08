import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Activity, Target, Scale, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { apiGet, apiPost } from "../lib/api";
import GlassCard from "../components/GlassCard";
import toast from "react-hot-toast";

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"volume" | "strength" | "body" | "consistency">("volume");
  const [volumeData, setVolumeData] = useState<{ muscle_group: string; total_volume: number }[]>([]);
  const [strengthData, setStrengthData] = useState<{ exercise_name: string; data: { date: string; max_weight: number }[] }[]>([]);
  const [bodyForm, setBodyForm] = useState({ weight_kg: "", body_fat_percentage: "", chest_cm: "", waist_cm: "", hips_cm: "" });

  useEffect(() => {
    if (tab === "volume") apiGet<{ muscle_groups: { muscle_group: string; total_volume: number }[] }>("/api/analytics/volume?days=30").then((d) => setVolumeData(d.muscle_groups || [])).catch(() => {});
    if (tab === "strength") apiGet<{ exercises: { exercise_name: string; data: { date: string; max_weight: number }[] }[] }>("/api/analytics/strength-progress?days=90").then((d) => setStrengthData(d.exercises || [])).catch(() => {});
  }, [tab]);

  const logBody = async () => {
    try {
      const data: Record<string, number> = {};
      if (bodyForm.weight_kg) data.weight_kg = parseFloat(bodyForm.weight_kg);
      if (bodyForm.body_fat_percentage) data.body_fat_percentage = parseFloat(bodyForm.body_fat_percentage);
      if (bodyForm.chest_cm) data.chest_cm = parseFloat(bodyForm.chest_cm);
      if (bodyForm.waist_cm) data.waist_cm = parseFloat(bodyForm.waist_cm);
      if (bodyForm.hips_cm) data.hips_cm = parseFloat(bodyForm.hips_cm);
      await apiPost("/api/body-metrics", data);
      toast.success("Body metrics logged!");
      setBodyForm({ weight_kg: "", body_fat_percentage: "", chest_cm: "", waist_cm: "", hips_cm: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const radarData = volumeData.map((v) => ({ subject: v.muscle_group, volume: v.total_volume }));

  const tabs = [
    { key: "volume" as const, label: "Volume", icon: BarChart3 },
    { key: "strength" as const, label: "Strength", icon: TrendingUp },
    { key: "body" as const, label: t("dashboard.bodyComposition"), icon: Scale },
    { key: "consistency" as const, label: "Consistency", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-green-400" /> {t("nav.analytics")}
      </h1>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tb) => (
          <button key={tb.key} onClick={() => setTab(tb.key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === tb.key ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>
            <tb.icon className="w-4 h-4" /> {tb.label}
          </button>
        ))}
      </div>

      {tab === "volume" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard glow="bg-cyan-500">
            <h3 className="text-xl font-bold text-white mb-4">Volume by Muscle Group (30 days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeData}>
                <XAxis dataKey="muscle_group" stroke="#666" fontSize={11} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
                <Bar dataKey="total_volume" fill="url(#volumeGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
          <GlassCard glow="bg-purple-500">
            <h3 className="text-xl font-bold text-white mb-4">Muscle Balance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData.length > 0 ? radarData : [{ subject: "No data", volume: 0 }]}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" stroke="#999" fontSize={11} />
                <PolarRadiusAxis stroke="#666" fontSize={10} />
                <Radar dataKey="volume" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      )}

      {tab === "strength" && (
        <GlassCard glow="bg-orange-500">
          <h3 className="text-xl font-bold text-white mb-4">Strength Progress (90 days)</h3>
          {strengthData.length > 0 ? (
            <div className="space-y-6">
              {strengthData.slice(0, 5).map((ex) => (
                <div key={ex.exercise_name}>
                  <p className="text-white font-medium mb-2">{ex.exercise_name}</p>
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={ex.data}>
                      <XAxis dataKey="date" stroke="#666" fontSize={10} />
                      <YAxis stroke="#666" fontSize={10} />
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
                      <Line type="monotone" dataKey="max_weight" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316", r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Log workouts to see your strength progress</p>
            </div>
          )}
        </GlassCard>
      )}

      {tab === "body" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard glow="bg-pink-500">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-pink-400" /> Log Body Metrics
            </h3>
            <div className="space-y-4">
              {[
                { key: "weight_kg", label: "Weight (kg)" },
                { key: "body_fat_percentage", label: "Body Fat (%)" },
                { key: "chest_cm", label: "Chest (cm)" },
                { key: "waist_cm", label: "Waist (cm)" },
                { key: "hips_cm", label: "Hips (cm)" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-sm text-gray-400">{f.label}</label>
                  <input type="number" value={(bodyForm as Record<string, string>)[f.key]} onChange={(e) => setBodyForm({ ...bodyForm, [f.key]: e.target.value })} className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white" placeholder={f.label} />
                </div>
              ))}
              <button onClick={logBody} className="w-full py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Log Metrics
              </button>
            </div>
          </GlassCard>
          <GlassCard glow="bg-blue-500">
            <h3 className="text-xl font-bold text-white mb-4">Progress Photos</h3>
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
              <Scale className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">Upload progress photos</p>
              <p className="text-xs text-gray-500">Track your visual transformation</p>
            </div>
          </GlassCard>
        </div>
      )}

      {tab === "consistency" && (
        <GlassCard glow="bg-green-500">
          <h3 className="text-xl font-bold text-white mb-4">Workout Consistency Heatmap</h3>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 84 }, (_, i) => {
              const intensity = Math.random();
              let color = "bg-white/5";
              if (intensity > 0.8) color = "bg-green-500";
              else if (intensity > 0.6) color = "bg-green-500/60";
              else if (intensity > 0.4) color = "bg-green-500/30";
              else if (intensity > 0.2) color = "bg-green-500/10";
              return <div key={i} className={`aspect-square rounded-sm ${color}`} title={`Day ${i + 1}`} />;
            })}
          </div>
          <div className="flex items-center gap-2 mt-4 justify-end">
            <span className="text-xs text-gray-400">Less</span>
            {["bg-white/5", "bg-green-500/10", "bg-green-500/30", "bg-green-500/60", "bg-green-500"].map((c) => (
              <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
            <span className="text-xs text-gray-400">More</span>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
