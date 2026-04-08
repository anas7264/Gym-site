import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, Mail, Lock, User, UserCircle } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { changeLanguage } from "../i18n";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ username: "", email: "", password: "", full_name: "" });
  const [showPass, setShowPass] = useState(false);
  const isRTL = i18n.language === "ar" || i18n.language === "he";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ ...form, language: i18n.language });
      toast.success("Welcome to GymSite!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const languages = [
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" },
    { code: "he", label: "עברית" },
  ];

  const fields = [
    { key: "full_name" as const, icon: UserCircle, label: t("auth.fullName"), type: "text", placeholder: "John Doe" },
    { key: "username" as const, icon: User, label: t("auth.username"), type: "text", placeholder: "champion123" },
    { key: "email" as const, icon: Mail, label: t("auth.email"), type: "email", placeholder: "you@example.com" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="fixed top-4 right-4 flex gap-2 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              i18n.language === lang.code ? "bg-cyan-500 text-white" : "bg-white/10 text-gray-400 hover:text-white"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 shadow-2xl shadow-purple-500/20"
          >
            <Zap className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">{t("auth.joinUs")}</h1>
          <p className="text-gray-400">{t("auth.tagline")}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm text-gray-400 mb-2">{field.label}</label>
                <div className="relative">
                  <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" style={isRTL ? { left: "auto", right: 12 } : {}} />
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    required
                    className={`w-full ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"} py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all`}
                    placeholder={field.placeholder}
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm text-gray-400 mb-2">{t("auth.password")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" style={isRTL ? { left: "auto", right: 12 } : {}} />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  className={`w-full ${isRTL ? "pr-11 pl-11" : "pl-11 pr-11"} py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" style={isRTL ? { right: "auto", left: 12 } : {}}>
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:from-purple-400 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 mt-2">
              {isLoading ? t("common.loading") : t("auth.register")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {t("auth.hasAccount")}{" "}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">{t("auth.signIn")}</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
