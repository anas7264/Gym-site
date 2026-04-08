import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Dumbbell, Apple, Droplets } from "lucide-react";
import GlassCard from "../components/GlassCard";

export default function CalendarPage() {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Simulated workout days
  const workoutDays = new Set([2, 4, 7, 9, 11, 14, 16, 18, 21, 23, 25, 28]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <Calendar className="w-8 h-8 text-indigo-400" /> {t("nav.calendar")}
      </h1>

      <GlassCard glow="bg-indigo-500">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <h2 className="text-xl font-bold text-white">{monthNames[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-sm text-gray-400 py-2">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const hasWorkout = workoutDays.has(day);

            return (
              <motion.div
                key={day}
                whileHover={{ scale: 1.1 }}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all relative ${
                  isToday ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20" :
                  hasWorkout ? "bg-green-500/10 border border-green-500/20 text-green-400" :
                  "hover:bg-white/5 text-gray-300"
                }`}
              >
                <span className="text-sm font-medium">{day}</span>
                {hasWorkout && !isToday && (
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-0.5" />
                )}
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Today's Schedule */}
      <GlassCard glow="bg-cyan-500">
        <h3 className="text-lg font-semibold text-white mb-4">{t("common.today")}&apos;s Schedule</h3>
        <div className="space-y-3">
          {[
            { time: "07:00", label: "Morning Workout - Push Day", icon: Dumbbell, color: "text-cyan-400" },
            { time: "08:30", label: "Breakfast - High Protein", icon: Apple, color: "text-green-400" },
            { time: "12:00", label: "Lunch - Balanced Meal", icon: Apple, color: "text-green-400" },
            { time: "15:00", label: "Water Reminder - 500ml", icon: Droplets, color: "text-blue-400" },
            { time: "18:00", label: "Evening Cardio - 30min", icon: Dumbbell, color: "text-orange-400" },
            { time: "19:30", label: "Dinner - Recovery Meal", icon: Apple, color: "text-green-400" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
              <span className="text-sm text-gray-400 w-14">{item.time}</span>
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="text-white text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
