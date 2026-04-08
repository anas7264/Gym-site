import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Heart, Brain, Moon, Wind, SmilePlus, Battery } from "lucide-react";
import { apiPost } from "../lib/api";
import GlassCard from "../components/GlassCard";
import ProgressRing from "../components/ProgressRing";
import toast from "react-hot-toast";

export default function WellnessPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"mood" | "meditation" | "sleep" | "breathing">("mood");
  const [moodScore, setMoodScore] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [sleepHours, setSleepHours] = useState(7);
  const [meditationActive, setMeditationActive] = useState(false);
  const [meditationTime, setMeditationTime] = useState(0);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathActive, setBreathActive] = useState(false);

  const moods = [
    { emoji: "😤", label: "Stressed", value: 1, color: "bg-red-500/20 text-red-400" },
    { emoji: "😟", label: "Anxious", value: 2, color: "bg-orange-500/20 text-orange-400" },
    { emoji: "😐", label: "Neutral", value: 3, color: "bg-gray-500/20 text-gray-400" },
    { emoji: "😊", label: "Good", value: 4, color: "bg-green-500/20 text-green-400" },
    { emoji: "🤩", label: "Amazing", value: 5, color: "bg-cyan-500/20 text-cyan-400" },
  ];

  const logMood = async () => {
    try {
      await apiPost("/api/mood-logs", { mood: moodScore, energy_level: energyLevel, sleep_hours: sleepHours, notes: moods.find(m => m.value === moodScore)?.label || "" });
      toast.success("Mood logged!");
    } catch { toast.error("Failed to log mood"); }
  };

  // Meditation timer
  const startMeditation = () => {
    setMeditationActive(true);
    setMeditationTime(0);
    const interval = setInterval(() => {
      setMeditationTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  };

  // Breathing exercise
  const startBreathing = () => {
    setBreathActive(true);
    let phase = 0;
    const phases: ("inhale" | "hold" | "exhale")[] = ["inhale", "hold", "exhale"];
    const durations = [4000, 7000, 8000]; // 4-7-8 breathing
    const cycle = () => {
      setBreathPhase(phases[phase % 3]);
      setTimeout(() => {
        phase++;
        if (phase < 12) cycle(); // 4 full cycles
        else setBreathActive(false);
      }, durations[phase % 3]);
    };
    cycle();
  };

  const tabs = [
    { key: "mood" as const, label: t("dashboard.moodTracker"), icon: SmilePlus },
    { key: "meditation" as const, label: "Meditation", icon: Brain },
    { key: "sleep" as const, label: "Sleep", icon: Moon },
    { key: "breathing" as const, label: "Breathing", icon: Wind },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <Heart className="w-8 h-8 text-pink-400" /> {t("nav.wellness")}
      </h1>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tb) => (
          <button key={tb.key} onClick={() => setTab(tb.key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === tb.key ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>
            <tb.icon className="w-4 h-4" /> {tb.label}
          </button>
        ))}
      </div>

      {tab === "mood" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard glow="bg-pink-500">
            <h3 className="text-xl font-bold text-white mb-6">How are you feeling?</h3>
            <div className="flex gap-3 justify-center mb-6">
              {moods.map((mood) => (
                <motion.button key={mood.value} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => setMoodScore(mood.value)} className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${moodScore === mood.value ? mood.color + " border border-current" : "bg-white/5"}`}>
                  <span className="text-3xl">{mood.emoji}</span>
                  <span className="text-xs">{mood.label}</span>
                </motion.button>
              ))}
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  <Battery className="w-4 h-4" /> Energy Level
                </label>
                <input type="range" min={1} max={5} value={energyLevel} onChange={(e) => setEnergyLevel(parseInt(e.target.value))} className="w-full mt-2 accent-pink-500" />
                <div className="flex justify-between text-xs text-gray-500"><span>Low</span><span>High</span></div>
              </div>
              <div>
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  <Moon className="w-4 h-4" /> Sleep Hours
                </label>
                <input type="range" min={0} max={12} step={0.5} value={sleepHours} onChange={(e) => setSleepHours(parseFloat(e.target.value))} className="w-full mt-2 accent-indigo-500" />
                <p className="text-center text-white font-bold mt-1">{sleepHours}h</p>
              </div>
              <button onClick={logMood} className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold">Log Mood</button>
            </div>
          </GlassCard>

          <GlassCard glow="bg-purple-500">
            <h3 className="text-xl font-bold text-white mb-4">Weekly Mood Overview</h3>
            <div className="grid grid-cols-7 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                const moodVal = [4, 3, 5, 4, 2, 5, 4][i];
                const emoji = moods.find(m => m.value === moodVal)?.emoji || "😐";
                return (
                  <div key={day} className="text-center">
                    <p className="text-xs text-gray-400 mb-2">{day}</p>
                    <div className="w-12 h-12 mx-auto rounded-xl bg-white/5 flex items-center justify-center text-xl">{emoji}</div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}

      {tab === "meditation" && (
        <GlassCard glow="bg-purple-500" className="text-center">
          <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Guided Meditation</h3>
          <p className="text-gray-400 mb-8">Find your inner peace and focus</p>
          <ProgressRing progress={meditationActive ? (meditationTime / 600) * 100 : 0} size={200} color="stroke-purple-400">
            <div>
              <p className="text-3xl font-mono font-bold text-white">{Math.floor(meditationTime / 60)}:{(meditationTime % 60).toString().padStart(2, "0")}</p>
              <p className="text-xs text-gray-400">{meditationActive ? "Meditating..." : "Ready"}</p>
            </div>
          </ProgressRing>
          <div className="flex gap-3 justify-center mt-8">
            {[5, 10, 15, 20].map((min) => (
              <button key={min} className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-purple-500/20 hover:text-purple-400 transition-all text-sm">{min} min</button>
            ))}
          </div>
          <button onClick={meditationActive ? () => setMeditationActive(false) : startMeditation} className={`mt-6 px-8 py-3 rounded-xl font-semibold ${meditationActive ? "bg-red-500/20 text-red-400" : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"}`}>
            {meditationActive ? "Stop" : "Start Meditation"}
          </button>
        </GlassCard>
      )}

      {tab === "sleep" && (
        <GlassCard glow="bg-indigo-500">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-400" /> Sleep Tracker
          </h3>
          <div className="grid grid-cols-7 gap-3 mb-6">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
              const hours = [7, 6.5, 8, 7.5, 6, 9, 8][i];
              const height = (hours / 10) * 100;
              const color = hours >= 7 ? "bg-green-500" : hours >= 6 ? "bg-yellow-500" : "bg-red-500";
              return (
                <div key={day} className="text-center">
                  <div className="h-32 flex items-end justify-center mb-2">
                    <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }} className={`w-8 rounded-t-lg ${color}`} />
                  </div>
                  <p className="text-xs text-gray-400">{day}</p>
                  <p className="text-xs text-white font-medium">{hours}h</p>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-white/5">
              <p className="text-2xl font-bold text-indigo-400">7.4h</p>
              <p className="text-xs text-gray-400">Avg Sleep</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5">
              <p className="text-2xl font-bold text-green-400">85%</p>
              <p className="text-xs text-gray-400">Sleep Quality</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5">
              <p className="text-2xl font-bold text-purple-400">11:15pm</p>
              <p className="text-xs text-gray-400">Avg Bedtime</p>
            </div>
          </div>
        </GlassCard>
      )}

      {tab === "breathing" && (
        <GlassCard glow="bg-teal-500" className="text-center">
          <Wind className="w-16 h-16 text-teal-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">4-7-8 Breathing</h3>
          <p className="text-gray-400 mb-8">Calm your mind with guided breathing</p>
          <motion.div animate={{ scale: breathActive ? (breathPhase === "inhale" ? 1.5 : breathPhase === "hold" ? 1.5 : 1) : 1 }} transition={{ duration: breathPhase === "inhale" ? 4 : breathPhase === "hold" ? 7 : 8 }} className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-teal-500/30 to-cyan-500/30 border border-teal-500/30 flex items-center justify-center mb-8">
            <p className="text-xl font-bold text-teal-400 capitalize">{breathActive ? breathPhase : "Ready"}</p>
          </motion.div>
          <div className="flex gap-4 justify-center text-sm mb-8">
            <div className="px-4 py-2 rounded-xl bg-white/5"><span className="text-teal-400">4s</span> Inhale</div>
            <div className="px-4 py-2 rounded-xl bg-white/5"><span className="text-yellow-400">7s</span> Hold</div>
            <div className="px-4 py-2 rounded-xl bg-white/5"><span className="text-blue-400">8s</span> Exhale</div>
          </div>
          <button onClick={breathActive ? () => setBreathActive(false) : startBreathing} className={`px-8 py-3 rounded-xl font-semibold ${breathActive ? "bg-red-500/20 text-red-400" : "bg-gradient-to-r from-teal-500 to-cyan-600 text-white"}`}>
            {breathActive ? "Stop" : "Start Breathing"}
          </button>
        </GlassCard>
      )}
    </div>
  );
}
