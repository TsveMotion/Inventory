import React, { useState } from "react";
import { API_URL } from "../config";

export default function VintedBot() {
  const [products, setProducts] = useState([]);
  const [keywords, setKeywords] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      if (!keywords) throw new Error("Please enter keywords.");
      let url = `${API_URL}/vinted-bot-search?keywords=${encodeURIComponent(keywords)}`;
      if (minPrice) url += `&min_price=${encodeURIComponent(minPrice)}`;
      if (maxPrice) url += `&max_price=${encodeURIComponent(maxPrice)}`;
      if (sort) url += `&sort=${encodeURIComponent(sort)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Vinted Bot</h1>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Keywords (e.g. Ralph Lauren hoodie)"
          className="border px-2 py-1 rounded w-64"
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min price (£)"
          className="border px-2 py-1 rounded w-32"
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max price (£)"
          className="border px-2 py-1 rounded w-32"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
        />
        <select
          className="border px-2 py-1 rounded w-40"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="newest">Newest to Oldest</option>
          <option value="oldest">Oldest to Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={fetchProducts}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      {error && <div className="text-red-600 font-semibold mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product, idx) => (
          <div key={idx} className="border rounded p-4 bg-gray-50 flex flex-col">
            <img src={product.image_url} alt={product.title} className="w-full h-48 object-cover rounded mb-2" />
            <div className="font-bold text-lg mb-1">{product.title}</div>
            <div className="mb-1">Price: <span className="font-bold">£{product.price}</span></div>
            <div className="text-gray-600 mb-2">{product.description}</div>
            {/* --- Additional Vinted Fields --- */}
            {product.seller_rating !== undefined && product.seller_rating !== null && (
              <div className="mb-1">Seller Rating: <span className="font-semibold">{product.seller_rating}</span></div>
            )}
            {product.seller_feedback_count !== undefined && product.seller_feedback_count !== null && (
              <div className="mb-1">Seller Feedbacks: <span className="font-semibold">{product.seller_feedback_count}</span></div>
            )}
            {product.created_at && (
              <div className="mb-1">Posted: <span className="font-semibold">{new Date(product.created_at).toLocaleString()}</span></div>
            )}
            {product.bump_time && (
              <div className="mb-1">Bump Time: <span className="font-semibold">{product.bump_time}</span></div>
            )}
            {product.view_count !== undefined && product.view_count !== null && (
              <div className="mb-1">Views: <span className="font-semibold">{product.view_count}</span></div>
            )}
            {product.interested_count !== undefined && product.interested_count !== null && (
              <div className="mb-1">Interested: <span className="font-semibold">{product.interested_count}</span></div>
            )}
            {product.condition && (
              <div className="mb-1">Condition: <span className="font-semibold">{product.condition}</span></div>
            )}
            {product.size && (
              <div className="mb-1">Size: <span className="font-semibold">{product.size}</span></div>
            )}
            <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View on Vinted</a>
          </div>
        ))}
      </div>
      {products.length === 0 && !loading && <div className="text-gray-500 mt-8">No products found. Try different keywords or price.</div>}
    </div>
  );
}
