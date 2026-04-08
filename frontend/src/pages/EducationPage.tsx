import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { BookOpen, Clock, Eye, ChevronRight } from "lucide-react";
import { apiGet } from "../lib/api";
import GlassCard from "../components/GlassCard";

interface Article {
  id: number;
  title_en: string;
  title_ar: string;
  title_he: string;
  content_en: string;
  content_ar: string;
  content_he: string;
  category: string;
  read_time_minutes: number;
  views: number;
  author: string;
}

export default function EducationPage() {
  const { t, i18n } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selected, setSelected] = useState<Article | null>(null);
  const [category, setCategory] = useState("");
  const langTitle = `title_${i18n.language}` as keyof Article;
  const langContent = `content_${i18n.language}` as keyof Article;

  useEffect(() => {
    apiGet<Article[]>("/api/articles").then(setArticles).catch(() => {});
  }, []);

  const categories = [...new Set(articles.map((a) => a.category))];
  const filtered = category ? articles.filter((a) => a.category === category) : articles;

  const categoryColors: Record<string, string> = {
    training: "from-cyan-500 to-blue-600",
    nutrition: "from-green-500 to-emerald-600",
    recovery: "from-purple-500 to-pink-600",
    science: "from-yellow-500 to-orange-600",
    lifestyle: "from-red-500 to-rose-600",
    myths: "from-indigo-500 to-violet-600",
  };

  if (selected) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          ← {t("common.back")}
        </button>
        <GlassCard glow="bg-blue-500">
          <div className="mb-4">
            <span className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${categoryColors[selected.category] || "from-gray-500 to-gray-600"} text-white capitalize`}>
              {selected.category}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">{(selected[langTitle] as string) || selected.title_en}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
            <span>{selected.author}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selected.read_time_minutes} min</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {selected.views}</span>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{(selected[langContent] as string) || selected.content_en}</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-blue-400" /> {t("nav.education")}
      </h1>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setCategory("")} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${!category ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>
          All
        </button>
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap capitalize transition-all ${category === c ? `bg-gradient-to-r ${categoryColors[c] || "from-gray-500 to-gray-600"} text-white` : "bg-white/5 text-gray-400 hover:text-white"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((article, i) => (
          <motion.div key={article.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} onClick={() => setSelected(article)}>
            <GlassCard hover className="cursor-pointer h-full">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${categoryColors[article.category] || "from-gray-500 to-gray-600"} text-white capitalize`}>
                  {article.category}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {article.read_time_minutes} min
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{(article[langTitle] as string) || article.title_en}</h3>
              <p className="text-sm text-gray-400 line-clamp-3 mb-4">{((article[langContent] as string) || article.content_en)?.slice(0, 150)}...</p>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                <span className="text-xs text-gray-400">{article.author}</span>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <GlassCard className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">{t("common.noData")}</p>
        </GlassCard>
      )}
    </div>
  );
}
