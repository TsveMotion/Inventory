import React, { useState, useEffect } from "react";

export default function InvoiceInfoModal({ open, onClose, onContinue, initialRecipient, initialProducts }) {
  const [recipient, setRecipient] = useState(initialRecipient || {
    name: "",
    address1: "",
    address2: ""
  });
  const [products, setProducts] = useState(initialProducts || [
    { description: "", quantity: 1, price: 0, source: "custom", inventoryId: null }
  ]);
  const [inventory, setInventory] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // Fetch inventory when modal opens
  useEffect(() => {
    if (open) {
      fetch("http://localhost:8000/inventory/")
        .then(res => res.json())
        .then(data => setInventory(data));
      // Set current date and unique invoice number
      const now = new Date();
      setInvoiceDate(now.toISOString().slice(0, 10));
      setInvoiceNumber(`INV-${now.getTime()}-${Math.floor(Math.random()*1000)}`);
    }
  }, [open]);

  if (!open) return null;

  const handleRecipientChange = (field, value) => {
    setRecipient(prev => ({ ...prev, [field]: value }));
  };

  const handleProductChange = (idx, field, value) => {
    setProducts(prev => prev.map((row, i) =>
      i === idx ? { ...row, [field]: field === "quantity" || field === "price" ? Number(value) : value } : row
    ));
  };

  // Handle inventory selection for a product row
  const handleProductSourceChange = (idx, value) => {
    if (value === "custom") {
      setProducts(prev => prev.map((row, i) => i === idx ? { description: "", quantity: 1, price: 0, source: "custom", inventoryId: null } : row));
    } else {
      // Find item in inventory
      const invItem = inventory.find(item => item.id === Number(value));
      setProducts(prev => prev.map((row, i) => i === idx ? {
        description: invItem?.item_name || "",
        quantity: invItem?.quantity || 1,
        price: invItem?.sale_price || 0,
        source: "inventory",
        inventoryId: invItem?.id
      } : row));
    }
  };

  const handleAddProduct = () => {
    setProducts(prev => [...prev, { description: "", quantity: 1, price: 0, source: "custom", inventoryId: null }]);
  };

  const handleRemoveProduct = (idx) => {
    setProducts(prev => prev.filter((_, i) => i !== idx));
  };

  const handleContinue = () => {
    if (!recipient.name || !recipient.address1) {
      alert("Please fill in at least the recipient name and address line 1.");
      return;
    }
    if (products.length === 0 || products.some(p => !p.description || p.quantity <= 0)) {
      alert("Please enter at least one valid product with quantity > 0.");
      return;
    }
    onContinue({ recipient, products, invoiceDate, invoiceNumber });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[400px] relative flex flex-col items-center">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <div className="text-2xl font-bold mb-4">Enter Invoice Details</div>
        <div className="w-full mb-3">
          <div className="font-bold mb-1">Recipient Name</div>
          <input className="border rounded w-full px-2 py-1 mb-2" value={recipient.name} onChange={e => handleRecipientChange("name", e.target.value)} placeholder="Recipient Name" />
          <div className="font-bold mb-1">Recipient Address 1</div>
          <input className="border rounded w-full px-2 py-1 mb-2" value={recipient.address1} onChange={e => handleRecipientChange("address1", e.target.value)} placeholder="Address Line 1" />
          <div className="font-bold mb-1">Recipient Address 2</div>
          <input className="border rounded w-full px-2 py-1 mb-4" value={recipient.address2} onChange={e => handleRecipientChange("address2", e.target.value)} placeholder="Address Line 2" />
        </div>
        <div className="w-full mb-3">
          <div className="font-bold mb-2">Products / Items</div>
          {products.map((product, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <select
                className="border rounded px-2 py-1"
                value={product.source === "inventory" ? product.inventoryId || "" : "custom"}
                onChange={e => handleProductSourceChange(idx, e.target.value)}
              >
                <option value="custom">Custom Product</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>{item.item_name}</option>
                ))}
              </select>
              <input className="border rounded px-2 py-1 flex-1" value={product.description} onChange={e => handleProductChange(idx, "description", e.target.value)} placeholder="Description" />
              <input className="border rounded px-2 py-1 w-16" type="number" min="1" value={product.quantity} onChange={e => handleProductChange(idx, "quantity", e.target.value)} placeholder="Qty" />
              <input className="border rounded px-2 py-1 w-20" type="number" min="0" value={product.price} onChange={e => handleProductChange(idx, "price", e.target.value)} placeholder="Price" />
              {products.length > 1 && (
                <button className="text-red-500 hover:text-red-700 text-xl" onClick={() => handleRemoveProduct(idx)} title="Remove">&times;</button>
              )}
            </div>
          ))}
          <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mt-1" onClick={handleAddProduct}>+ Add Item</button>
        </div>
        <div className="w-full mb-3 flex gap-4">
          <div className="flex-1">
            <div className="font-bold mb-1">Invoice Date</div>
            <input className="border rounded w-full px-2 py-1" value={invoiceDate} disabled />
          </div>
          <div className="flex-1">
            <div className="font-bold mb-1">Invoice Number</div>
            <input className="border rounded w-full px-2 py-1" value={invoiceNumber} disabled />
          </div>
        </div>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full" onClick={handleContinue}>Continue to Print</button>
      </div>
    </div>
  );
}
