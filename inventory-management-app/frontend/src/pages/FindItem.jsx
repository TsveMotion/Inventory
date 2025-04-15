import React, { useState, useEffect } from "react";
import FindItemRack from "../components/FindItemRack";

// Dummy fetch (replace with real API)
const fetchInventory = async () => {
  const res = await fetch("http://localhost:8000/inventory");
  return res.ok ? res.json() : [];
};

export default function FindItem() {
  const [inventory, setInventory] = useState([]);
  useEffect(() => { fetchInventory().then(setInventory); }, []);
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Find Item</h1>
      <FindItemRack inventory={inventory} setInventory={setInventory} />
    </div>
  );
}
