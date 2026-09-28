import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ShoppingBag, Star, ShoppingCart } from "lucide-react";
import GlassCard from "../components/GlassCard";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
}

const products: Product[] = [
  { id: 1, name: "Premium Whey Protein", description: "25g protein per serving, chocolate flavor", price: 49.99, currency: "$", category: "supplements", image: "🥤", rating: 4.8, reviews: 234 },
  { id: 2, name: "Creatine Monohydrate", description: "Pure micronized creatine, 60 servings", price: 29.99, currency: "$", category: "supplements", image: "💊", rating: 4.9, reviews: 456 },
  { id: 3, name: "Resistance Bands Set", description: "5 bands with different resistance levels", price: 24.99, currency: "$", category: "equipment", image: "🏋️", rating: 4.6, reviews: 178 },
  { id: 4, name: "Gym Gloves Pro", description: "Premium leather with wrist support", price: 19.99, currency: "$", category: "gear", image: "🧤", rating: 4.7, reviews: 312 },
  { id: 5, name: "Shaker Bottle", description: "BPA-free, leak-proof, 700ml", price: 14.99, currency: "$", category: "accessories", image: "🍶", rating: 4.5, reviews: 567 },
  { id: 6, name: "Foam Roller", description: "High-density EVA foam for muscle recovery", price: 34.99, currency: "$", category: "recovery", image: "🧘", rating: 4.8, reviews: 289 },
  { id: 7, name: "BCAA Powder", description: "2:1:1 ratio, watermelon flavor", price: 39.99, currency: "$", category: "supplements", image: "🥤", rating: 4.6, reviews: 145 },
  { id: 8, name: "Premium Membership", description: "1 year access to all features + AI coach", price: 99.99, currency: "$", category: "membership", image: "👑", rating: 5.0, reviews: 890 },
  { id: 9, name: "Workout Plan Bundle", description: "12-week transformation program", price: 29.99, currency: "$", category: "digital", image: "📱", rating: 4.7, reviews: 432 },
  { id: 10, name: "Meal Prep Containers", description: "Set of 10, BPA-free, microwave safe", price: 22.99, currency: "$", category: "accessories", image: "🍱", rating: 4.4, reviews: 198 },
  { id: 11, name: "Pre-Workout Formula", description: "300mg caffeine, beta-alanine, citrulline", price: 44.99, currency: "$", category: "supplements", image: "⚡", rating: 4.7, reviews: 367 },
  { id: 12, name: "Yoga Mat Premium", description: "6mm thick, non-slip, eco-friendly", price: 39.99, currency: "$", category: "equipment", image: "🧘", rating: 4.8, reviews: 523 },
];

export default function StorePage() {
  const { t } = useTranslation();
  const [category, setCategory] = useState("");
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [showCart, setShowCart] = useState(false);

  const categories = [...new Set(products.map((p) => p.category))];
  const filtered = category ? products.filter((p) => p.category === category) : products;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) return prev.map((c) => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { product, qty: 1 }];
    });
    toast.success(`${product.name} added to cart!`);
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.product.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-amber-400" /> {t("nav.store")}
        </h1>
        <button onClick={() => setShowCart(!showCart)} className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 transition-colors">
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center">{cartCount}</span>
          )}
        </button>
      </div>

      {/* Cart Panel */}
      {showCart && cart.length > 0 && (
        <GlassCard glow="bg-cyan-500">
          <h3 className="text-lg font-bold text-white mb-4">Shopping Cart</h3>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.product.image}</span>
                  <div>
                    <p className="text-white text-sm">{item.product.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                  </div>
                </div>
                <p className="text-cyan-400 font-bold">${(item.product.price * item.qty).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <p className="text-white font-bold">Total: ${cartTotal.toFixed(2)}</p>
            <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold">Checkout</button>
          </div>
        </GlassCard>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setCategory("")} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap capitalize transition-all ${!category ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>
          All
        </button>
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap capitalize transition-all ${category === c ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((product, i) => (
          <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard hover className="h-full flex flex-col">
              <div className="text-5xl text-center mb-4">{product.image}</div>
              <h3 className="font-semibold text-white mb-1">{product.name}</h3>
              <p className="text-sm text-gray-400 mb-3 flex-1">{product.description}</p>
              <div className="flex items-center gap-1 mb-3">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-yellow-400">{product.rating}</span>
                <span className="text-xs text-gray-500">({product.reviews})</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-white">{product.currency}{product.price}</p>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => addToCart(product)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium">
                  Add to Cart
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
