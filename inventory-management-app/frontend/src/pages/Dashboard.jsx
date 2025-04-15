import React, { useState, useEffect } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import { format, subMonths, isWithinInterval, parseISO } from "date-fns";
import { FiBox, FiTrendingUp, FiShoppingCart, FiSearch, FiPackage, FiUsers, FiPercent, FiDollarSign } from "react-icons/fi";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, TimeScale);

// Dummy fetch functions (replace with real API calls)
const fetchInventory = async () => {
  const res = await fetch("http://localhost:8000/inventory");
  return res.ok ? res.json() : [];
};
const fetchSales = async () => {
  // Example: fetch all inventory and treat items with sale_price > 0 as sales
  const res = await fetch("http://localhost:8000/inventory");
  if (!res.ok) return [];
  const data = await res.json();
  return data.filter(item => item.sale_price && item.sale_price > 0);
};
const fetchVinted = async () => {
  const res = await fetch("http://localhost:8000/vinted-bot-search?keywords=");
  return res.ok ? res.json() : { products: [] };
};

export default function Dashboard() {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [vinted, setVinted] = useState([]);
  const [dateRange, setDateRange] = useState({ from: format(subMonths(new Date(), 1), "yyyy-MM-dd"), to: format(new Date(), "yyyy-MM-dd") });
  const [filteredSales, setFilteredSales] = useState([]);

  useEffect(() => {
    fetchInventory().then(setInventory);
    fetchSales().then(setSales);
    fetchVinted().then(data => setVinted(data.products || []));
  }, []);

  useEffect(() => {
    setFilteredSales(
      sales.filter(item => {
        if (!item.date_of_input) return false;
        const date = parseISO(item.date_of_input);
        return isWithinInterval(date, {
          start: parseISO(dateRange.from),
          end: parseISO(dateRange.to),
        });
      })
    );
  }, [sales, dateRange]);

  // Chart data
  const salesByMonth = {};
  filteredSales.forEach(item => {
    const month = format(parseISO(item.date_of_input), "yyyy-MM");
    salesByMonth[month] = (salesByMonth[month] || 0) + 1;
  });
  const months = Object.keys(salesByMonth).sort();

  const profitSum = filteredSales.reduce((acc, item) => acc + (item.profit || 0), 0);
  const totalSales = filteredSales.length;
  const inventoryCount = inventory.length;
  const vintedCount = vinted.length;

  return (
    <div className="flex flex-col h-full w-full p-8 gap-6 overflow-hidden">
      {/* Top Cards */}
      <div className="grid grid-cols-4 gap-6 mb-2">
        <div className="bg-white rounded-xl shadow flex flex-col items-center justify-center p-6 min-w-[160px]">
          <FiBox className="text-3xl text-blue-500 mb-2" />
          <div className="text-2xl font-bold">{inventoryCount}</div>
          <div className="text-gray-500">Inventory Items</div>
        </div>
        <div className="bg-white rounded-xl shadow flex flex-col items-center justify-center p-6 min-w-[160px]">
          <FiTrendingUp className="text-3xl text-green-500 mb-2" />
          <div className="text-2xl font-bold">{totalSales}</div>
          <div className="text-gray-500">Sales (Filtered)</div>
        </div>
        <div className="bg-white rounded-xl shadow flex flex-col items-center justify-center p-6 min-w-[160px]">
          <FiDollarSign className="text-3xl text-emerald-500 mb-2" />
          <div className="text-2xl font-bold">£{profitSum.toFixed(2)}</div>
          <div className="text-gray-500">Profit (Filtered)</div>
        </div>
        <div className="bg-white rounded-xl shadow flex flex-col items-center justify-center p-6 min-w-[160px]">
          <FiPackage className="text-3xl text-purple-500 mb-2" />
          <div className="text-2xl font-bold">{vintedCount}</div>
          <div className="text-gray-500">Vinted Listings</div>
        </div>
      </div>
      {/* Date Filter */}
      <div className="flex gap-4 items-center mb-2">
        <label className="font-semibold">From:</label>
        <input type="date" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))} className="border rounded px-2 py-1" />
        <label className="font-semibold">To:</label>
        <input type="date" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))} className="border rounded px-2 py-1" />
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Sales by Month Bar Chart */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-start h-[260px]">
          <div className="font-bold mb-2 flex items-center gap-2"><FiTrendingUp className="text-green-500" /> Sales by Month</div>
          <div className="w-full flex-1 flex items-center justify-center">
            <Bar
              data={{
                labels: months,
                datasets: [
                  {
                    label: "Sales",
                    data: months.map(m => salesByMonth[m]),
                    backgroundColor: "#34d399",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { display: false } } },
                maintainAspectRatio: false,
              }}
              height={180}
            />
          </div>
        </div>
        {/* Profit Line Chart */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-start h-[260px]">
          <div className="font-bold mb-2 flex items-center gap-2"><FiPercent className="text-emerald-500" /> Profit Trend</div>
          <div className="w-full flex-1 flex items-center justify-center">
            <Line
              data={{
                labels: months,
                datasets: [
                  {
                    label: "Profit",
                    data: months.map(m => filteredSales.filter(i => format(parseISO(i.date_of_input), "yyyy-MM") === m).reduce((acc, i) => acc + (i.profit || 0), 0)),
                    borderColor: "#6366f1",
                    backgroundColor: "#c7d2fe",
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { display: false } } },
                maintainAspectRatio: false,
              }}
              height={180}
            />
          </div>
        </div>
        {/* Inventory by Category Doughnut Chart */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-start h-[260px]">
          <div className="font-bold mb-2 flex items-center gap-2"><FiBox className="text-blue-400" /> Inventory by Category</div>
          <div className="w-full flex-1 flex items-center justify-center">
            <Doughnut
              data={{
                labels: Array.from(new Set(inventory.map(i => i.category || "Uncategorized"))),
                datasets: [
                  {
                    label: "Inventory",
                    data: Array.from(new Set(inventory.map(i => i.category || "Uncategorized"))).map(cat => inventory.filter(i => (i.category || "Uncategorized") === cat).length),
                    backgroundColor: ["#60a5fa", "#fbbf24", "#34d399", "#f87171", "#a78bfa", "#f472b6", "#facc15", "#4ade80"],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { position: "bottom" } },
                cutout: "70%",
                maintainAspectRatio: false,
              }}
              height={180}
            />
          </div>
        </div>
      </div>
      {/* Mini Tabs Section */}
      <div className="grid grid-cols-3 gap-6 mt-4">
        {/* Inventory Table Preview */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center">
          <div className="font-bold mb-2 flex items-center gap-2"><FiSearch className="text-blue-500" /> Inventory Preview</div>
          <div className="overflow-x-auto w-full max-h-40">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1">Name</th>
                  <th className="px-2 py-1">Qty</th>
                  <th className="px-2 py-1">Category</th>
                </tr>
              </thead>
              <tbody>
                {inventory.slice(0, 5).map(i => (
                  <tr key={i.id}>
                    <td className="px-2 py-1">{i.item_name}</td>
                    <td className="px-2 py-1">{i.quantity}</td>
                    <td className="px-2 py-1">{i.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Vinted Preview */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center">
          <div className="font-bold mb-2 flex items-center gap-2"><FiUsers className="text-purple-500" /> Vinted Preview</div>
          <div className="overflow-x-auto w-full max-h-40">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1">Title</th>
                  <th className="px-2 py-1">Price</th>
                </tr>
              </thead>
              <tbody>
                {vinted.slice(0, 5).map((p, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-1 truncate max-w-[120px]">{p.title}</td>
                    <td className="px-2 py-1">£{p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Scan In/Out Preview */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center">
          <div className="font-bold mb-2 flex items-center gap-2"><FiShoppingCart className="text-green-400" /> Scan In/Out Preview</div>
          <div className="text-gray-500 text-sm">Use the Scan In/Out tab to update inventory in real time!</div>
        </div>
      </div>
    </div>
  );
}
