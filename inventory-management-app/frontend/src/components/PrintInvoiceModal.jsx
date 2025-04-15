import React, { useRef, useState, useEffect } from "react";
import logo from "../assets/logo.png";

export default function PrintInvoiceModal({ open, onClose, item, recipient, products }) {
  // All hooks must be called at the top level, unconditionally
  const printRef = useRef();
  const [localRecipient, setLocalRecipient] = useState(recipient || {
    name: "",
    address1: "",
    address2: ""
  });
  const [localProducts, setLocalProducts] = useState(products || [
    { description: item?.item_name || '', quantity: item?.quantity || 1, price: item?.sale_price || 0 }
  ]);

  // Debug: Log props on modal open
  useEffect(() => {
    if (open) {
      console.log("[PrintInvoiceModal] open:", open);
      console.log("[PrintInvoiceModal] item:", item);
      console.log("[PrintInvoiceModal] recipient:", recipient);
      console.log("[PrintInvoiceModal] products:", products);
    }
  }, [open, item, recipient, products]);

  useEffect(() => {
    if (recipient) setLocalRecipient(recipient);
    if (products) setLocalProducts(products);
  }, [recipient, products]);

  // Defensive: Check for required fields (render only)
  if (!open) return null;
  if (!item) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white p-6 rounded shadow-lg min-w-[320px] relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
          <h2 className="text-lg font-bold mb-4 text-red-600">Error: No item data provided for invoice.</h2>
          <div className="text-gray-700">Please try again or contact support.</div>
        </div>
      </div>
    );
  }
  if (!item.item_name || typeof item.quantity === 'undefined') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white p-6 rounded shadow-lg min-w-[320px] relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
          <h2 className="text-lg font-bold mb-4 text-red-600">Error: Incomplete item data for invoice.</h2>
          <div className="text-gray-700">Item name or quantity is missing. Please try again.</div>
        </div>
      </div>
    );
  }

  const invoiceNumber = `F${item.id}${String(item.barcode || '').slice(-4)}`;
  const today = item.date_of_input ? new Date(item.date_of_input) : new Date();
  const dateString = today.toLocaleDateString('en-GB');

  // Print only after DOM is painted and ref is ready
  const handlePrint = () => {
    setTimeout(() => {
      if (!printRef.current || !printRef.current.innerHTML.trim()) {
        alert("Invoice content is not ready to print. Please try again.");
        return;
      }
      const printContents = printRef.current.innerHTML;
      const html = `<!DOCTYPE html>
<html><head><title>Print Invoice</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f6f8fa; margin: 0; }
  .invoice-container { max-width: 700px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 16px #0001; padding: 40px 32px; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #eaeaea; padding-bottom: 18px; margin-bottom: 28px; }
  .logo { height: 60px; }
  .invoice-title { font-size: 2rem; font-weight: 700; color: #2c3e50; letter-spacing: 2px; }
  .meta { margin-bottom: 24px; }
  .meta-row { display: flex; gap: 32px; font-size: 1rem; color: #333; }
  .section-title { font-weight: 600; font-size: 1.1rem; margin: 18px 0 8px 0; color: #294b7a; }
  .info-block { margin-bottom: 18px; }
  .invoice-table { border-collapse: collapse; width: 100%; margin-top: 8px; background: #fafbfc; }
  .invoice-table th, .invoice-table td { border: 1px solid #d4d7dd; padding: 8px 12px; text-align: center; }
  .invoice-table th { background: #f2f4f7; color: #294b7a; font-weight: 600; }
  .invoice-table td { font-size: 1rem; }
  .total-row td { font-weight: 700; background: #f2f4f7; }
  .footer { margin-top: 32px; font-size: 1rem; color: #555; text-align: center; }
</style>
</head><body>
  <div class="invoice-container">
    <div class="header">
      <img src="${logo}" alt="Logo" class="logo" />
      <span class="invoice-title">INVOICE</span>
    </div>
    <div class="meta">
      <div class="meta-row"><strong>Invoice #:</strong> <span>${invoiceNumber}</span></div>
      <div class="meta-row"><strong>Date:</strong> <span>${dateString}</span></div>
    </div>
    <div class="info-block">
      <div class="section-title">FROM:</div>
      <div><strong>Kristiyan Tsvetanov</strong></div>
      <div><strong>Phone :</strong> (+44) 07305979981</div>
      <div><strong>Email :</strong> tsvetozarkt@gmail.com</div>
    </div>
    <div class="info-block">
      <div class="section-title">TO:</div>
      <div><strong>${localRecipient.name || 'Recipient Name'}</strong></div>
      <div>${localRecipient.address1 || ''}</div>
      <div>${localRecipient.address2 || ''}</div>
    </div>
    <div class="section-title">DESCRIPTION OF PRODUCTS</div>
    <table class="invoice-table">
      <thead>
        <tr>
          <th>NUM</th>
          <th>DESCRIPTION</th>
          <th>QUANTITY</th>
          <th>PRICE</th>
          <th>SUB TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${localProducts.map((prod, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td>${prod.description}</td>
            <td>${prod.quantity}</td>
            <td>£ ${Number(prod.price).toFixed(2)}</td>
            <td>£ ${(Number(prod.price) * Number(prod.quantity)).toFixed(2)}</td>
          </tr>`).join('')}
        <tr class="total-row">
          <td colspan="4">TOTAL</td>
          <td>£ ${localProducts.reduce((sum, p) => sum + Number(p.price) * Number(p.quantity), 0).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    <div class="footer">
      Thank you for your purchase!<br/>
      If you have any questions, feel free to contact me at (+44) 07305 979981.<br/>
      Your support means a lot!
    </div>
  </div>
</body></html>`;
      const printWindow = window.open('', '', 'width=900,height=1200');
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }, 50);
  };

  const sumSubTotal = localProducts.reduce((sum, row) => sum + (Number(row.price) * Number(row.quantity) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded shadow-lg min-w-[320px] max-w-2xl w-full relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold" onClick={onClose}>&times;</button>
        <div ref={printRef} className="">
          <div className="invoice-container">
            <div className="header">
              <img src={logo} alt="Logo" className="logo" style={{ maxWidth: '100px', maxHeight: '60px', height: 'auto', width: 'auto' }} />
              <span className="invoice-title">INVOICE</span>
            </div>
            <div className="meta">
              <div className="meta-row"><strong>Invoice #:</strong> <span>{invoiceNumber}</span></div>
              <div className="meta-row"><strong>Date:</strong> <span>{dateString}</span></div>
            </div>
            <div className="info-block">
              <div className="section-title">FROM:</div>
              <div><strong>Kristiyan Tsvetanov</strong></div>
              <div><strong>Phone :</strong> (+44) 07305979981</div>
              <div><strong>Email :</strong> tsvetozarkt@gmail.com</div>
            </div>
            <div className="info-block">
              <div className="section-title">TO:</div>
              <div><strong>{localRecipient.name || 'Recipient Name'}</strong></div>
              <div>{localRecipient.address1}</div>
              <div>{localRecipient.address2}</div>
            </div>
            <div className="section-title">DESCRIPTION OF PRODUCTS</div>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>NUM</th>
                  <th>DESCRIPTION</th>
                  <th>QUANTITY</th>
                  <th>PRICE</th>
                  <th>SUB TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {localProducts.map((prod, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{prod.description}</td>
                    <td>{prod.quantity}</td>
                    <td>£ {Number(prod.price).toFixed(2)}</td>
                    <td>£ {(Number(prod.price) * Number(prod.quantity)).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan="4">TOTAL</td>
                  <td>£ {localProducts.reduce((sum, p) => sum + Number(p.price) * Number(p.quantity), 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <div className="footer">
              Thank you for your purchase!<br/>
              If you have any questions, feel free to contact me at (+44) 07305 979981.<br/>
              Your support means a lot!
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="bg-blue-700 text-white px-6 py-2 rounded shadow hover:bg-blue-800 transition font-semibold"
            onClick={handlePrint}
          >
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
