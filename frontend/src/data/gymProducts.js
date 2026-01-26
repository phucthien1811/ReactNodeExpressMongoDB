// Mock data for gym products
export const gymProducts = [
  // Protein & Supplements
  {
    id: 1,
    name: "Whey Protein Isolate",
    category: "supplements",
    price: 899000,
    originalPrice: 1200000,
    image: "https://i.ibb.co/LDbckzjR/s5.png",
    rating: 4.8,
    reviews: 245,
    description: "100% Whey Protein Isolate - 2.5kg, hương vani",
    inStock: true,
    tags: ["protein", "muscle building", "recovery"],
    brand: "Royal Nutrition"
  },
  {
    id: 2,
    name: "BCAA Energy Drink",
    category: "supplements",
    price: 450000,
    originalPrice: 550000,
    image: "#",
    rating: 4.6,
    reviews: 189,
    description: "BCAA 2:1:1 với caffeine tự nhiên - 30 servings",
    inStock: true,
    tags: ["bcaa", "energy", "endurance"],
    brand: "Royal Nutrition"
  },
  {
    id: 3,
    name: "Creatine Monohydrate",
    category: "supplements",
    price: 320000,
    originalPrice: 400000,
    image: "#",
    rating: 4.9,
    reviews: 312,
    description: "100% Pure Creatine Monohydrate - 300g",
    inStock: true,
    tags: ["creatine", "strength", "power"],
    brand: "Royal Nutrition"
  },

  // Equipment
  {
    id: 4,
    name: "Adjustable Dumbbells Set",
    category: "equipment",
    price: 2500000,
    originalPrice: 3200000,
    image: "#",
    rating: 4.7,
    reviews: 98,
    description: "Bộ tạ đa năng 5-50kg, tiết kiệm không gian",
    inStock: true,
    tags: ["dumbbells", "strength", "home gym"],
    brand: "Royal Fitness"
  },
  {
    id: 5,
    name: "Resistance Bands Set",
    category: "equipment",
    price: 350000,
    originalPrice: 450000,
    image: "#",
    rating: 4.5,
    reviews: 156,
    description: "Bộ 5 dây kháng lực với độ đàn hồi khác nhau",
    inStock: true,
    tags: ["resistance", "flexibility", "home workout"],
    brand: "Royal Fitness"
  },
  {
    id: 6,
    name: "Yoga Mat Premium",
    category: "equipment",
    price: 280000,
    originalPrice: 380000,
    image: "#",
    rating: 4.6,
    reviews: 203,
    description: "Thảm yoga cao cấp 6mm, chống trượt",
    inStock: true,
    tags: ["yoga", "mat", "flexibility"],
    brand: "Royal Fitness"
  },

  // Apparel
  {
    id: 7,
    name: "Performance Tank Top",
    category: "apparel",
    price: 180000,
    originalPrice: 250000,
    image: "#",
    rating: 4.4,
    reviews: 87,
    description: "Áo tank top thể thao nam, vải thoáng khí",
    inStock: true,
    tags: ["tank top", "men", "breathable"],
    brand: "Royal Apparel"
  },
  {
    id: 8,
    name: "Sports Leggings",
    category: "apparel",
    price: 220000,
    originalPrice: 300000,
    image: "#",
    rating: 4.7,
    reviews: 124,
    description: "Quần legging thể thao nữ, co giãn 4 chiều",
    inStock: true,
    tags: ["leggings", "women", "flexible"],
    brand: "Royal Apparel"
  },
  {
    id: 9,
    name: "Training Shorts",
    category: "apparel",
    price: 150000,
    originalPrice: 200000,
    image: "#",
    rating: 4.3,
    reviews: 76,
    description: "Quần short tập luyện unisex, vải khô nhanh",
    inStock: false,
    tags: ["shorts", "unisex", "quick dry"],
    brand: "Royal Apparel"
  },

  // Accessories
  {
    id: 10,
    name: "Gym Gloves Pro",
    category: "accessories",
    price: 120000,
    originalPrice: 180000,
    image: "#",
    rating: 4.5,
    reviews: 134,
    description: "Găng tay tập gym chuyên nghiệp, chống trượt",
    inStock: true,
    tags: ["gloves", "grip", "protection"],
    brand: "Royal Gear"
  },
  {
    id: 11,
    name: "Water Bottle 1L",
    category: "accessories",
    price: 80000,
    originalPrice: 120000,
    image: "#",
    rating: 4.4,
    reviews: 89,
    description: "Bình nước thể thao 1L, không chứa BPA",
    inStock: true,
    tags: ["water bottle", "hydration", "bpa free"],
    brand: "Royal Gear"
  },
  {
    id: 12,
    name: "Gym Towel Set",
    category: "accessories",
    price: 95000,
    originalPrice: 140000,
    image: "#",
    rating: 4.2,
    reviews: 67,
    description: "Bộ 3 khăn tập gym, siêu thấm hút",
    inStock: true,
    tags: ["towel", "absorbent", "set"],
    brand: "Royal Gear"
  }
];

export const categories = [
  { id: "all", name: "Tất cả", icon: "🏪" },
  { id: "supplements", name: "Thực phẩm bổ sung", icon: "💊" },
  { id: "equipment", name: "Thiết bị tập luyện", icon: "🏋️" },
  { id: "apparel", name: "Trang phục thể thao", icon: "👕" },
  { id: "accessories", name: "Phụ kiện", icon: "🎒" }
];

export const sortOptions = [
  { value: "default", label: "Mặc định" },
  { value: "price_low", label: "Giá thấp đến cao" },
  { value: "price_high", label: "Giá cao đến thấp" },
  { value: "rating", label: "Đánh giá cao nhất" },
  { value: "newest", label: "Mới nhất" }
];