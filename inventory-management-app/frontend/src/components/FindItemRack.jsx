import React, { useState, useEffect } from "react";
import { FiSearch, FiBox } from "react-icons/fi";

// Constants for rack layout
const ROWS = ["A", "B", "C", "D", "E"];
const COLS = [1, 2, 3, 4, 5];
const LEDS_PER_BOX = 14;
const WLED_IP = "10.0.0.114";

function getBoxIndex(row, col) {
  return ROWS.indexOf(row) * COLS.length + (col - 1);
}

function getBoxLocation(index) {
  const row = ROWS[Math.floor(index / COLS.length)];
  const col = COLS[index % COLS.length];
  return `${row}${col}`;
}

export default function FindItemRack({ inventory, setInventory }) {
  const [query, setQuery] = useState("");
  const [foundItem, setFoundItem] = useState(null);
  const [highlightBox, setHighlightBox] = useState(null);
  const [modalBox, setModalBox] = useState(null);

  // Find item by name/location
  const handleSearch = (e) => {
    e.preventDefault();
    const item = inventory.find(
      (i) => i.item_name.toLowerCase() === query.trim().toLowerCase() ||
             (i.barcode && i.barcode === query.trim())
    );
    setFoundItem(item);
    if (item && item.location) {
      setHighlightBox(item.location.toUpperCase());
      lightUpBox(item.location.toUpperCase());
    } else {
      setHighlightBox(null);
    }
  };

  // Light up LEDs for a given box location using segments
  const lightUpBox = async (loc) => {
    // loc = e.g. "A1"
    const row = loc[0];
    const col = Number(loc.slice(1));
    const boxIdx = getBoxIndex(row, col);
    const start = boxIdx * LEDS_PER_BOX;
    const stop = start + LEDS_PER_BOX - 1;
    // Set segment for this box only
    await fetch(`http://${WLED_IP}/json/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seg: Array.from({length: ROWS.length * COLS.length}).map((_, i) =>
          i === boxIdx
            ? { id: i, start: i * LEDS_PER_BOX, stop: (i + 1) * LEDS_PER_BOX - 1, col: [[255, 180, 0]], bri: 255 }
            : { id: i, start: i * LEDS_PER_BOX, stop: (i + 1) * LEDS_PER_BOX - 1, col: [[20, 20, 20]], bri: 30 }
        ),
        on: true
      })
    });
  };

  // Get all items in a box
  const itemsInBox = (loc) => inventory.filter(i => (i.location || "").toUpperCase() === loc);

  // Standby mode for WLED
  const setStandbyMode = async () => {
    await fetch(`http://${WLED_IP}/json/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        on: true,
        bri: 102, // 40% of 255
        seg: [
          {
            id: 0,
            // Cover all LEDs
            start: 0,
            stop: ROWS.length * COLS.length * LEDS_PER_BOX - 1,
            col: [[255, 180, 0], [0,255,128], [128,0,255]], // Analogous palette (example)
            fx: 9 // Rainbow effect (usually id 9 in WLED)
          }
        ]
      })
    });
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full max-w-3xl mx-auto mt-6">
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Find item by name or barcode..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2" type="submit">
          <FiSearch /> Find Item
        </button>
      </form>
      <div className="flex flex-col items-center">
        <button
          className="mb-4 bg-gradient-to-r from-blue-400 to-green-400 text-white px-6 py-2 rounded shadow hover:from-blue-500 hover:to-green-500 font-semibold transition"
          onClick={setStandbyMode}
        >
          Set Standby Mode (Rainbow Analogous)
        </button>
        <div className="grid grid-cols-5 gap-4 mb-6">
          {ROWS.flatMap(row => COLS.map(col => {
            const loc = `${row}${col}`;
            const isHighlighted = highlightBox === loc || modalBox === loc;
            const items = itemsInBox(loc);
            return (
              <div
                key={loc}
                className={`w-20 h-20 flex flex-col items-center justify-center rounded-lg border-2 cursor-pointer transition-all duration-200 ${isHighlighted ? "border-yellow-400 bg-yellow-100 shadow-lg" : "border-gray-300 bg-gray-50"}`}
                onClick={() => setModalBox(loc)}
                title={`Box ${loc}`}
              >
                <FiBox className="text-2xl mb-1" />
                <span className="font-bold">{loc}</span>
                <span className="text-xs text-gray-500">{items.length} items</span>
              </div>
            );
          }))}
        </div>
        {foundItem && (
          <div className="mb-4 text-green-600 font-semibold">Found: {foundItem.item_name} ({foundItem.location})</div>
        )}
        {/* Modal for box contents */}
        {modalBox && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white rounded-xl shadow-lg p-6 min-w-[320px] relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setModalBox(null)}>&times;</button>
              <div className="font-bold text-lg mb-2">Box {modalBox}</div>
              <ul className="max-h-48 overflow-y-auto mb-4">
                {itemsInBox(modalBox).length === 0 ? (
                  <li className="text-gray-500">No items in this box.</li>
                ) : (
                  itemsInBox(modalBox).map(i => (
                    <li key={i.id} className="mb-2 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span>
                          <span className="font-semibold">{i.item_name}</span> <span className="text-xs text-gray-500">({i.barcode})</span>
                        </span>
                        <span className="ml-2 text-gray-700 text-xs">Qty: {i.quantity}</span>
                      </div>
                      <div className="flex gap-1 items-center">
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold"
                          onClick={async () => {
                            await fetch(`http://localhost:8000/inventory/scan`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ barcode: i.barcode, quantity: 1, mode: "in" })
                            });
                            setInventory(prev => prev.map(it => it.id === i.id ? { ...it, quantity: it.quantity + 1 } : it));
                          }}
                        >+1</button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold"
                          onClick={async () => {
                            await fetch(`http://localhost:8000/inventory/scan`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ barcode: i.barcode, quantity: 1, mode: "out" })
                            });
                            setInventory(prev => prev.map(it => it.id === i.id ? { ...it, quantity: Math.max(0, it.quantity - 1) } : it));
                          }}
                        >-1</button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
              <button
                className="mt-4 w-full bg-yellow-400 text-white py-2 rounded hover:bg-yellow-500 font-semibold"
                onClick={() => { setHighlightBox(modalBox); lightUpBox(modalBox); }}
              >
                Highlight this Box with LEDs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
