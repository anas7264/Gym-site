import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  Users,
  BarChart3,
  MessageCircle,
  Settings,
  Trophy,
  Target,
  BookOpen,
  ShoppingBag,
  Heart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Flame,
  Coins,
  Star,
  Zap,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import { changeLanguage } from "../i18n";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { path: "/workouts", icon: Dumbbell, key: "workouts" },
  { path: "/nutrition", icon: Apple, key: "nutrition" },
  { path: "/exercises", icon: Target, key: "exercises" },
  { path: "/community", icon: Users, key: "community" },
  { path: "/challenges", icon: Trophy, key: "challenges" },
  { path: "/achievements", icon: Star, key: "achievements" },
  { path: "/analytics", icon: BarChart3, key: "analytics" },
  { path: "/chat", icon: MessageCircle, key: "chat" },
  { path: "/calendar", icon: Calendar, key: "calendar" },
  { path: "/wellness", icon: Heart, key: "wellness" },
  { path: "/education", icon: BookOpen, key: "education" },
  { path: "/store", icon: ShoppingBag, key: "store" },
  { path: "/settings", icon: Settings, key: "settings" },
];

export default function Layout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRTL = i18n.language === "ar" || i18n.language === "he";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const languages = [
    { code: "en", label: "EN", name: "English" },
    { code: "ar", label: "ع", name: "العربية" },
    { code: "he", label: "עב", name: "עברית" },
  ];

  return (
    <div className={`min-h-screen ${isDark ? "dark" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex">
        {/* Mobile Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          className={`fixed lg:sticky top-0 h-screen z-50 flex flex-col border-r border-white/5 bg-gray-950/80 backdrop-blur-2xl transition-all duration-300 ${
            collapsed ? "w-20" : "w-72"
          } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${
            isRTL && !mobileOpen ? "translate-x-full lg:translate-x-0" : ""
          }`}
          style={isRTL ? { right: 0, left: "auto", borderRight: "none", borderLeft: "1px solid rgba(255,255,255,0.05)" } : {}}
        >
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
              >
                GymSite
              </motion.span>
            )}
          </div>

          {/* User Info */}
          {user && !collapsed && (
            <div className="px-6 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                  {user.full_name?.[0] || user.username[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.full_name || user.username}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      {user.streak}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      Lv.{user.level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-400" />
                      {user.coins}
                    </span>
                  </div>
                </div>
              </div>
              {/* XP Bar */}
              <div className="mt-2 px-1">
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(user.xp % 1000) / 10}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">{user.xp % 1000}/1000 XP</p>
              </div>
            </div>
          )}

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-y-1 left-0 w-1 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500"
                      style={isRTL ? { left: "auto", right: 0 } : {}}
                    />
                  )}
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-cyan-400" : ""}`} />
                  {!collapsed && (
                    <span className="text-sm font-medium">{t(`nav.${item.key}`)}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Collapse Button */}
          <div className="p-3 border-t border-white/5">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {collapsed ? (
                isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
              ) : (
                isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
              )}
            </button>
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors mt-1"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">{t("nav.logout")}</span>
              </button>
            )}
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 backdrop-blur-2xl bg-gray-950/60 border-b border-white/5">
            <div className="flex items-center justify-between px-4 lg:px-8 h-16">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-white/5"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <div className="flex items-center gap-3 ml-auto">
                {/* Language Switcher */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        i18n.language === lang.code
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggle}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {isDark ? "🌙" : "☀️"}
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
