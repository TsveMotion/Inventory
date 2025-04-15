import React from "react";

export default function InventoryActionModal({ open, onClose, item, onEdit, onDelete, onPrintBarcode, onPrintInvoice }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-4">Actions for: <span className="font-mono">{item.item_name}</span></h2>
        <div className="flex flex-col gap-3">
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700" onClick={() => { onEdit(item); onClose(); }}>Edit</button>
          <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700" onClick={() => { onPrintBarcode(item); onClose(); }}>Print Barcode</button>
          <button className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600" onClick={() => { onPrintInvoice(item); onClose(); }}>Print Invoice</button>
          <button className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600" onClick={() => { onDelete(item.id); onClose(); }}>Delete</button>
        </div>
      </div>
    </div>
  );
}
