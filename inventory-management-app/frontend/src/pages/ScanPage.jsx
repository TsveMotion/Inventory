import React, { useState } from "react";
import { FiBarChart2, FiCheckCircle, FiAlertCircle, FiChevronDown, FiChevronUp } from "react-icons/fi";
import API_URL from "../config";

export default function ScanPage() {
  const [mode, setMode] = useState("in"); // "in" or "out"
  const [barcode, setBarcode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [showDetails, setShowDetails] = useState(true);

  // Search for item by barcode
  const handleBarcodeSearch = async (e) => {
    e.preventDefault();
    setItem(null);
    setSearchError("");
    setMessage("");
    if (!barcode) return;
    setLoading(true);
    try {
      let url = `${API_URL}/inventory/barcode/${barcode}`;
      let res = await fetch(url);
      if (res.ok) {
        let data = await res.json();
        setItem(data);
        setSearchError("");
      } else {
        setSearchError("Item not found.");
        setItem(null);
      }
    } catch (err) {
      setSearchError("Error: " + err.message);
      setItem(null);
    }
    setLoading(false);
  };

  // Handle add/remove quantity
  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcode || !item) return;
    setLoading(true);
    setMessage("");
    try {
      let url = `${API_URL}/inventory/scan`;
      let res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode, quantity: Number(quantity), mode }),
      });
      let data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Success");
        setItem(prev => ({ ...prev, quantity: mode === "in" ? prev.quantity + Number(quantity) : prev.quantity - Number(quantity) }));
      } else {
        setMessage(data.detail || "Error");
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    }
    setLoading(false);
    setQuantity(1);
  };

  return (
    <div className="p-4 sm:p-8 max-w-lg mx-auto min-h-screen flex flex-col items-center justify-start bg-transparent">
      <div className="w-full max-w-md bg-white bg-opacity-90 backdrop-blur-md rounded-xl shadow-xl p-8 mt-12 mb-8 relative border border-blue-100">
        <div className="flex items-center gap-3 mb-6">
          <FiBarChart2 className="text-3xl text-blue-500" />
          <h1 className="text-2xl font-bold tracking-wide">Scan In // Scan Out</h1>
        </div>
        {/* Scan In/Out Toggle Tabs */}
        <div className="mb-6 flex w-full max-w-xs mx-auto">
          <button
            onClick={() => setMode("in")}
            className={`flex-1 py-2 px-4 text-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 border border-r-0 border-gray-300 ${
              mode === "in"
                ? "bg-green-600 text-white shadow rounded-l-lg z-10"
                : "bg-gray-100 text-gray-700 hover:bg-green-50 rounded-l-lg"
            }`}
            aria-pressed={mode === "in"}
            type="button"
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          >
            Scan In
          </button>
          <button
            onClick={() => setMode("out")}
            className={`flex-1 py-2 px-4 text-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 border border-l-0 border-gray-300 ${
              mode === "out"
                ? "bg-red-600 text-white shadow rounded-r-lg z-10"
                : "bg-gray-100 text-gray-700 hover:bg-red-50 rounded-r-lg"
            }`}
            aria-pressed={mode === "out"}
            type="button"
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            Scan Out
          </button>
        </div>
        {/* Barcode Search */}
        <form onSubmit={handleBarcodeSearch} className="flex flex-col gap-4 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Scan or enter barcode"
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              className="border px-3 py-2 rounded w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              autoFocus
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-lg flex items-center gap-2" disabled={loading}>
              {loading ? "..." : "Search"}
            </button>
          </div>
        </form>
        {searchError && (
          <div className="flex items-center gap-2 text-red-600 font-semibold mb-2"><FiAlertCircle /> {searchError}</div>
        )}
        {/* Show item details if found */}
        {item && (
          <div className="border rounded-xl p-4 mb-4 bg-gray-50 shadow-inner">
            <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setShowDetails(v => !v)}>
              <div className="font-bold text-lg mb-1">{item.item_name}</div>
              {showDetails ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            {showDetails && (
              <div className="mt-2">
                <div className="mb-1">Barcode: <span className="font-mono text-blue-600">{item.barcode}</span></div>
                <div>Current Quantity: <span className="font-bold text-green-700">{item.quantity}</span></div>
              </div>
            )}
            <form onSubmit={handleScan} className="flex flex-col gap-3 mt-4">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="border px-3 py-2 rounded w-32 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
              <button type="submit" className={`px-4 py-2 rounded font-semibold transition-colors ${mode === "in" ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700"}`} disabled={loading}>
                {loading ? "Processing..." : mode === "in" ? "Add Quantity" : "Remove Quantity"}
              </button>
            </form>
          </div>
        )}
        {message && (
          <div className={`mt-2 text-center text-lg font-semibold flex items-center justify-center gap-2 ${message.toLowerCase().includes("success") ? "text-green-600" : "text-blue-700"}`}>
            <FiCheckCircle /> {message}
          </div>
        )}
        <div className="mt-6 text-gray-500 text-sm text-center">
          Tip: Scan or enter a barcode to view and update item quantity.
        </div>
      </div>
    </div>
  );
}
