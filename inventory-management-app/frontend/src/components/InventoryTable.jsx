import React, { useState } from "react";
import InventoryActionModal from "./InventoryActionModal";

export default function InventoryTable({ items, onDelete, onEdit, onPrintBarcode, onPrintInvoice }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const openModal = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <>
      <div className="overflow-x-auto w-full">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 border">ID</th>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Barcode</th>
            <th className="px-4 py-2 border">Quantity</th>
            <th className="px-4 py-2 border">Location</th>
            <th className="px-4 py-2 border">Category</th>
            <th className="px-4 py-2 border">Supplier</th>
            <th className="px-4 py-2 border">Cost</th>
            <th className="px-4 py-2 border">Sale Price</th>
            <th className="px-4 py-2 border">Profit</th>
            <th className="px-4 py-2 border">Profit %</th>
            <th className="px-4 py-2 border">Date of Input</th>
            <th className="px-4 py-2 border">Last Updated</th>
            <th className="px-4 py-2 border"></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={13} className="text-center py-4 text-gray-500">No inventory items.</td>
            </tr>
          ) : (
            items.map((item) => {
              // Calculate shade of green for profit
              let profit = Number(item.profit ?? 0);
              let green = 200;
              let bg = '';
              if (profit > 0) {
                if (profit > 500) green = 500;
                else if (profit > 200) green = 400;
                else if (profit > 100) green = 300;
                else green = 200;
                bg = `bg-green-${green}`;
              } else if (profit < 0) {
                bg = 'bg-red-100';
              } else {
                bg = '';
              }
              return (
                <tr key={item.id}>
                  <td className="px-4 py-2 border">{item.id}</td>
                  <td className="px-4 py-2 border">{item.item_name}</td>
                  <td className="px-4 py-2 border">{item.barcode}</td>
                  <td className="px-4 py-2 border">{item.quantity}</td>
                  <td className="px-4 py-2 border">{item.location}</td>
                  <td className="px-4 py-2 border">{item.category}</td>
                  <td className="px-4 py-2 border">{item.supplier}</td>
                  <td className="px-4 py-2 border">{item.cost}</td>
                  <td className="px-4 py-2 border">{item.sale_price}</td>
                  <td className={`px-4 py-2 border font-semibold ${bg}`}>{item.profit}</td>
                  <td className={`px-4 py-2 border ${bg}`}>{item.profit_percent ? item.profit_percent.toFixed(2) + '%' : ''}</td>
                  <td className="px-4 py-2 border">{item.date_of_input ? new Date(item.date_of_input).toLocaleString() : ""}</td>
                  <td className="px-4 py-2 border">{item.last_updated ? new Date(item.last_updated).toLocaleString() : ""}</td>
                  <td className="px-4 py-2 border text-center">
                    <button
                      className="text-xl px-2 py-1 rounded hover:bg-gray-200"
                      onClick={() => openModal(item)}
                      title="Actions"
                    >
                      &#8942;
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      </div>
      <InventoryActionModal
        open={modalOpen}
        onClose={closeModal}
        item={selectedItem}
        onEdit={onEdit}
        onDelete={onDelete}
        onPrintBarcode={onPrintBarcode}
        onPrintInvoice={onPrintInvoice}
      />
    </>
  );
}
