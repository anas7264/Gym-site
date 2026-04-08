import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Settings, User, Globe, Bell, Shield, Palette, Ruler, Save } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import { changeLanguage } from "../i18n";
import GlassCard from "../components/GlassCard";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const [tab, setTab] = useState<"profile" | "preferences" | "notifications" | "security">("profile");
  const [profile, setProfile] = useState({
    full_name: user?.full_name || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    height_cm: user?.height_cm?.toString() || "",
    weight_kg: user?.weight_kg?.toString() || "",
    date_of_birth: user?.date_of_birth || "",
    gender: user?.gender || "male",
    fitness_goal: user?.fitness_goal || "muscle_gain",
    activity_level: user?.activity_level || "moderate",
  });

  const saveProfile = async () => {
    try {
      const data: Record<string, unknown> = { ...profile };
      if (profile.height_cm) data.height_cm = parseFloat(profile.height_cm);
      if (profile.weight_kg) data.weight_kg = parseFloat(profile.weight_kg);
      await updateUser(data as Parameters<typeof updateUser>[0]);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const tabs = [
    { key: "profile" as const, label: t("settings.profile"), icon: User },
    { key: "preferences" as const, label: t("settings.preferences"), icon: Palette },
    { key: "notifications" as const, label: t("settings.notifications"), icon: Bell },
    { key: "security" as const, label: t("settings.security"), icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <Settings className="w-8 h-8 text-gray-400" /> {t("settings.title")}
      </h1>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tb) => (
          <button key={tb.key} onClick={() => setTab(tb.key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === tb.key ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>
            <tb.icon className="w-4 h-4" /> {tb.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <GlassCard glow="bg-blue-500">
          <h3 className="text-xl font-bold text-white mb-6">{t("settings.profile")}</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white">
                {profile.full_name?.[0] || "?"}
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{profile.full_name || profile.username}</p>
                <p className="text-sm text-gray-400">Level {user?.level || 1} • {user?.xp || 0} XP</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "full_name", label: t("auth.fullName"), type: "text" },
                { key: "username", label: t("auth.username"), type: "text" },
                { key: "email", label: t("auth.email"), type: "email" },
                { key: "date_of_birth", label: "Date of Birth", type: "date" },
                { key: "height_cm", label: "Height (cm)", type: "number" },
                { key: "weight_kg", label: "Weight (kg)", type: "number" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-sm text-gray-400">{f.label}</label>
                  <input type={f.type} value={(profile as Record<string, string>)[f.key]} onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })} className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50" />
                </div>
              ))}
              <div>
                <label className="text-sm text-gray-400">Gender</label>
                <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">Fitness Goal</label>
                <select value={profile.fitness_goal} onChange={(e) => setProfile({ ...profile, fitness_goal: e.target.value })} className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white">
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="fat_loss">Fat Loss</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="strength">Strength</option>
                  <option value="endurance">Endurance</option>
                  <option value="flexibility">Flexibility</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-400">Bio</label>
                <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} className="w-full mt-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none" placeholder="Tell us about yourself..." />
              </div>
            </div>
            <button onClick={saveProfile} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold">
              <Save className="w-5 h-5" /> {t("common.save")}
            </button>
          </div>
        </GlassCard>
      )}

      {tab === "preferences" && (
        <div className="space-y-6">
          <GlassCard glow="bg-purple-500">
            <h3 className="text-xl font-bold text-white mb-4">{t("settings.language")}</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { code: "en", label: "English", native: "English", flag: "🇺🇸" },
                { code: "ar", label: "Arabic", native: "العربية", flag: "🇸🇦" },
                { code: "he", label: "Hebrew", native: "עברית", flag: "🇮🇱" },
              ].map((lang) => (
                <motion.button key={lang.code} whileHover={{ scale: 1.02 }} onClick={() => changeLanguage(lang.code)} className={`p-4 rounded-xl border transition-all text-center ${i18n.language === lang.code ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400" : "bg-white/5 border-white/10 text-gray-300"}`}>
                  <span className="text-3xl mb-2 block">{lang.flag}</span>
                  <p className="font-medium">{lang.native}</p>
                  <p className="text-xs text-gray-400">{lang.label}</p>
                </motion.button>
              ))}
            </div>
          </GlassCard>

          <GlassCard glow="bg-indigo-500">
            <h3 className="text-xl font-bold text-white mb-4">{t("settings.theme")}</h3>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div>
                <p className="text-white font-medium">{t("settings.darkMode")}</p>
                <p className="text-sm text-gray-400">Toggle dark/light theme</p>
              </div>
              <button onClick={toggle} className={`w-14 h-7 rounded-full transition-all ${isDark ? "bg-cyan-500" : "bg-gray-600"} relative`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${isDark ? "right-1" : "left-1"}`} />
              </button>
            </div>
          </GlassCard>

          <GlassCard glow="bg-green-500">
            <h3 className="text-xl font-bold text-white mb-4">{t("settings.units")}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-center">
                <Ruler className="w-6 h-6 mx-auto mb-2" />
                <p className="font-medium">{t("settings.metric")}</p>
                <p className="text-xs">kg, cm, km</p>
              </button>
              <button className="p-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-center">
                <Ruler className="w-6 h-6 mx-auto mb-2" />
                <p className="font-medium">{t("settings.imperial")}</p>
                <p className="text-xs">lbs, ft, mi</p>
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {tab === "notifications" && (
        <GlassCard glow="bg-yellow-500">
          <h3 className="text-xl font-bold text-white mb-4">{t("settings.notifications")}</h3>
          <div className="space-y-4">
            {[
              { label: "Workout Reminders", desc: "Daily workout notifications", enabled: true },
              { label: "Meal Reminders", desc: "Meal logging reminders", enabled: true },
              { label: "Water Reminders", desc: "Hydration alerts every 2 hours", enabled: false },
              { label: "Achievement Alerts", desc: "New achievement unlocked", enabled: true },
              { label: "Challenge Updates", desc: "Challenge progress and deadlines", enabled: true },
              { label: "Community Activity", desc: "Likes, comments, and mentions", enabled: false },
              { label: "Weekly Reports", desc: "Weekly fitness summary", enabled: true },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <p className="text-white font-medium text-sm">{n.label}</p>
                  <p className="text-xs text-gray-400">{n.desc}</p>
                </div>
                <button className={`w-12 h-6 rounded-full transition-all ${n.enabled ? "bg-cyan-500" : "bg-gray-600"} relative`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${n.enabled ? "right-1" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {tab === "security" && (
        <div className="space-y-6">
          <GlassCard glow="bg-red-500">
            <h3 className="text-xl font-bold text-white mb-4">{t("settings.security")}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Current Password</label>
                <input type="password" className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400">New Password</label>
                <input type="password" className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400">Confirm New Password</label>
                <input type="password" className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white" />
              </div>
              <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold">Update Password</button>
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div>
                <p className="text-white font-medium">2FA Status</p>
                <p className="text-sm text-gray-400">Add an extra layer of security</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 text-sm font-medium">Enable 2FA</button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
