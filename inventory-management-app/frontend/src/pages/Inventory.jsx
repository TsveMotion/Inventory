import React, { useEffect, useState } from "react";
import InventoryTable from "../components/InventoryTable";
import PrintBarcodeModal from "../components/PrintBarcodeModal";
import PrintInvoiceModal from "../components/PrintInvoiceModal";
import InvoiceInfoModal from "../components/InvoiceInfoModal";
import BarcodeScanner from "../components/BarcodeScanner";

const initialForm = {
  item_name: "",
  quantity: 1,
  location: "",
  category: "",
  supplier: "",
  cost: "",
  sale_price: "",
};

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [pendingInvoiceItem, setPendingInvoiceItem] = useState(null);
  const [pendingRecipient, setPendingRecipient] = useState(null);
  const [pendingProducts, setPendingProducts] = useState(null);

  const fetchItems = () => {
    setLoading(true);
    fetch("http://localhost:8000/inventory/")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/inventory/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          cost: form.cost ? Number(form.cost) : undefined,
          sale_price: form.sale_price ? Number(form.sale_price) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to add item");
      setForm(initialForm);
      fetchItems();
    } catch (err) {
      setError(err.message || "Error adding item");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await fetch(`http://localhost:8000/inventory/${id}`, {
      method: "DELETE",
    });
    fetchItems();
  };

  // Edit logic
  const handleEdit = (item) => {
    setEditItem(item);
    setEditModalOpen(true);
  };
  const handleEditSave = async (updatedItem) => {
    await fetch(`http://localhost:8000/inventory/${updatedItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedItem),
    });
    setEditModalOpen(false);
    setEditItem(null);
    fetchItems();
  };

  // Print barcode logic
  const handlePrintBarcode = (item) => {
    setModalItem(item);
    setBarcodeModalOpen(true);
  };
  // Print invoice logic
  const handlePrintInvoice = (item) => {
    setPendingInvoiceItem(item);
    setInfoModalOpen(true);
    setPendingRecipient(null);
    setPendingProducts(item ? [{ description: item.item_name, quantity: item.quantity, price: item.sale_price || 0 }] : [{ description: '', quantity: 1, price: 0 }]);
  };

  const handleInvoiceInfoContinue = ({ recipient, products }) => {
    setPendingRecipient(recipient);
    setPendingProducts(products);
    setInfoModalOpen(false);
    setModalItem(pendingInvoiceItem);
    setInvoiceModalOpen(true);
  };

  const handleBarcodeDetected = (barcode) => {
    // Focus/filter item in table or add logic here
    alert("Barcode detected: " + barcode);
    setShowScanner(false);
  };

  // Export inventory as CSV
  const handleExportCSV = () => {
    if (!items.length) return;
    const headers = Object.keys(items[0]);
    const csvRows = [headers.join(",")];
    for (const item of items) {
      csvRows.push(headers.map(h => {
        let val = item[h];
        if (typeof val === 'string') {
          val = '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
      }).join(","));
    }
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  // Print all barcodes
  const handlePrintAllBarcodes = () => {
    if (!items.length) return;
    const html = `<!DOCTYPE html>
<html><head><title>Print All Barcodes</title>
  <style>
    body { font-family: sans-serif; background: #fff; }
    .barcode-grid { display: flex; flex-wrap: wrap; gap: 24px; justify-content: flex-start; }
    .barcode-label { width: 210px; border: 1px solid #eee; border-radius: 8px; padding: 16px 8px; margin-bottom: 8px; display: flex; flex-direction: column; align-items: center; }
    .barcode-label .name { font-size: 16px; font-weight: bold; margin-bottom: 6px; text-align: center; }
    .barcode-label .barcode { margin-bottom: 4px; }
  </style>
</head><body>
  <h2 style="text-align:center;">All Inventory Barcodes</h2>
  <div class="barcode-grid">
    ${items.map(item => `
      <div class="barcode-label">
        <div class="name">${item.item_name || ''}</div>
        <div class="barcode"><svg id="barcode-${item.id}"></svg></div>
        <div style="font-size:12px;">${item.barcode || item.id || ''}</div>
      </div>
    `).join('')}
  </div>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
  <script>
    window.onload = function() {
      ${items.map(item => `
        if (typeof JsBarcode !== 'undefined') {
          JsBarcode("#barcode-${item.id}", "${item.barcode || item.id || ''}", { width:2, height:48, fontSize:12, displayValue:true });
        }
      `).join('')}
      setTimeout(function() { window.print(); window.close(); }, 600);
    };
  </script>
</body></html>`;
    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold shadow"
          onClick={() => setShowScanner(true)}
        >
          Scan Barcode
        </button>
        <button
          className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold shadow"
          onClick={handleExportCSV}
        >
          Export
        </button>
        <button
          className="ml-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-semibold shadow"
          onClick={handlePrintAllBarcodes}
        >
          Print All Barcodes
        </button>
      </div>
      <form className="mb-6 flex flex-wrap gap-4 items-end" onSubmit={handleAdd}>
        <input name="item_name" value={form.item_name} onChange={handleChange} placeholder="Name" required className="border px-2 py-1 rounded" />
        <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} placeholder="Quantity" required className="border px-2 py-1 rounded w-24" />
        <input name="location" value={form.location} onChange={handleChange} placeholder="Inventory Location" className="border px-2 py-1 rounded" />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="border px-2 py-1 rounded" />
        <input name="supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier (link)" className="border px-2 py-1 rounded" />
        <input name="cost" type="number" step="0.01" value={form.cost} onChange={handleChange} placeholder="Cost" className="border px-2 py-1 rounded w-28" />
        <input name="sale_price" type="number" step="0.01" value={form.sale_price} onChange={handleChange} placeholder="Sale Price" className="border px-2 py-1 rounded w-28" />
        <button type="submit" disabled={adding} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">{adding ? "Adding..." : "Add Item"}</button>
        {error && <span className="text-red-500 ml-4">{error}</span>}
      </form>
      {loading ? <div>Loading...</div> : (
        <InventoryTable
          items={items}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onPrintBarcode={(item) => {
            setModalItem(item);
            setBarcodeModalOpen(true);
          }}
          onPrintInvoice={handlePrintInvoice}
        />
      )}
      {/* Edit Modal (very basic) */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg min-w-[320px] relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setEditModalOpen(false)}>&times;</button>
            <h2 className="text-lg font-bold mb-4">Edit Item</h2>
            <form onSubmit={e => { e.preventDefault(); handleEditSave(editItem); }} className="flex flex-col gap-2">
              <input name="item_name" value={editItem.item_name} onChange={e => setEditItem({ ...editItem, item_name: e.target.value })} required className="border px-2 py-1 rounded" />
              <input name="quantity" type="number" min="1" value={editItem.quantity} onChange={e => setEditItem({ ...editItem, quantity: Number(e.target.value) })} required className="border px-2 py-1 rounded" />
              <input name="location" value={editItem.location} onChange={e => setEditItem({ ...editItem, location: e.target.value })} className="border px-2 py-1 rounded" />
              <input name="category" value={editItem.category} onChange={e => setEditItem({ ...editItem, category: e.target.value })} className="border px-2 py-1 rounded" />
              <input name="supplier" value={editItem.supplier} onChange={e => setEditItem({ ...editItem, supplier: e.target.value })} className="border px-2 py-1 rounded" />
              <input name="cost" type="number" step="0.01" value={editItem.cost} onChange={e => setEditItem({ ...editItem, cost: Number(e.target.value) })} className="border px-2 py-1 rounded w-28" />
              <input name="sale_price" type="number" step="0.01" value={editItem.sale_price} onChange={e => setEditItem({ ...editItem, sale_price: Number(e.target.value) })} className="border px-2 py-1 rounded w-28" />
              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Save</button>
                <button type="button" className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400" onClick={() => setEditModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Print Barcode Modal */}
      <PrintBarcodeModal
        open={barcodeModalOpen}
        onClose={() => setBarcodeModalOpen(false)}
        item={modalItem}
      />
      {/* Print Invoice Modal */}
      <PrintInvoiceModal
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        item={modalItem}
        recipient={pendingRecipient}
        products={pendingProducts}
      />
      <InvoiceInfoModal
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        onContinue={handleInvoiceInfoContinue}
        initialRecipient={pendingRecipient}
        initialProducts={pendingProducts}
      />
      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
