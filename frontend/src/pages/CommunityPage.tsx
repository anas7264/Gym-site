import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Users, Heart, MessageCircle, Plus, Trophy, Medal, Crown, Send } from "lucide-react";
import { apiGet, apiPost } from "../lib/api";
import GlassCard from "../components/GlassCard";
import toast from "react-hot-toast";

interface Post {
  id: number;
  content: string;
  post_type: string;
  likes_count: number;
  author_name: string;
  author_level: number;
  created_at: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  full_name: string;
  level: number;
  xp: number;
  streak: number;
}

export default function CommunityPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"feed" | "leaderboard">("feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState("general");

  useEffect(() => {
    if (tab === "feed") apiGet<Post[]>("/api/posts").then(setPosts).catch(() => {});
    if (tab === "leaderboard") apiGet<LeaderboardEntry[]>("/api/leaderboard?sort_by=xp&limit=20").then(setLeaderboard).catch(() => {});
  }, [tab]);

  const createPost = async () => {
    if (!newPost.trim()) return;
    try {
      await apiPost("/api/posts", { content: newPost, post_type: postType });
      setNewPost("");
      const p = await apiGet<Post[]>("/api/posts");
      setPosts(p);
      toast.success("Posted!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const likePost = async (id: number) => {
    try {
      await apiPost(`/api/posts/${id}/like`, {});
      setPosts(posts.map((p) => p.id === id ? { ...p, likes_count: p.likes_count + 1 } : p));
    } catch {}
  };

  const rankIcon = (r: number) => {
    if (r === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (r === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (r === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-gray-400 font-bold">#{r}</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <Users className="w-8 h-8 text-purple-400" /> {t("nav.community")}
      </h1>

      <div className="flex gap-2">
        <button onClick={() => setTab("feed")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${tab === "feed" ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>
          <MessageCircle className="w-4 h-4" /> Feed
        </button>
        <button onClick={() => setTab("leaderboard")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${tab === "leaderboard" ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>
          <Trophy className="w-4 h-4" /> {t("gamification.leaderboard")}
        </button>
      </div>

      {tab === "feed" && (
        <>
          {/* New Post */}
          <GlassCard glow="bg-purple-500">
            <div className="space-y-3">
              <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Share your fitness journey..." rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none" />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {["general", "achievement", "workout", "nutrition", "motivation"].map((type) => (
                    <button key={type} onClick={() => setPostType(type)} className={`px-3 py-1 rounded-lg text-xs capitalize ${postType === type ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-gray-400"}`}>
                      {type}
                    </button>
                  ))}
                </div>
                <button onClick={createPost} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium">
                  <Send className="w-4 h-4" /> Post
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <GlassCard>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
                      {post.author_name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-white font-medium">{post.author_name}</p>
                      <p className="text-xs text-gray-400">Level {post.author_level} • {new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="ml-auto text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400 capitalize">{post.post_type}</span>
                  </div>
                  <p className="text-gray-200 mb-4">{post.content}</p>
                  <div className="flex items-center gap-4">
                    <button onClick={() => likePost(post.id)} className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors">
                      <Heart className="w-4 h-4" /> {post.likes_count}
                    </button>
                    <button className="flex items-center gap-1 text-gray-400 hover:text-cyan-400 transition-colors">
                      <MessageCircle className="w-4 h-4" /> Reply
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
            {posts.length === 0 && (
              <GlassCard className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No posts yet. Be the first!</p>
              </GlassCard>
            )}
          </div>
        </>
      )}

      {tab === "leaderboard" && (
        <GlassCard glow="bg-yellow-500">
          <h3 className="text-xl font-bold text-white mb-6">{t("gamification.leaderboard")}</h3>
          <div className="space-y-3">
            {leaderboard.map((entry, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={`flex items-center gap-4 p-4 rounded-xl ${i < 3 ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20" : "bg-white/5"}`}>
                <div className="w-10 flex justify-center">{rankIcon(entry.rank)}</div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white">
                  {entry.full_name?.[0] || entry.username[0]}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{entry.full_name || entry.username}</p>
                  <p className="text-xs text-gray-400">Level {entry.level} • {entry.streak} day streak</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-yellow-400">{entry.xp.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">XP</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
