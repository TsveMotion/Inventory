import React, { useRef } from "react";
import Barcode from "react-barcode";

export default function PrintBarcodeModal({ open, onClose, item }) {
  const barcodeRef = useRef();

  if (!open || !item) return null;

  const handlePrint = () => {
    // Use external script and wait for it to load before rendering barcode
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Print Barcode</title>
  <style>
    body { font-family: sans-serif; }
    .barcode-label { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
    .barcode-label .name { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
    .barcode-label .barcode { margin-bottom: 8px; }
    .error { color: red; font-weight: bold; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="barcode-label">
    <div class="name">${item.item_name}</div>
    <div class="barcode"><svg id="barcode-svg"></svg></div>
    <div id="fallback">Loading barcode...</div>
  </div>
  <script>
    function showError(msg) {
      var fallback = document.getElementById('fallback');
      fallback.innerText = msg;
      fallback.className = 'error';
    }
    function renderBarcode() {
      try {
        if (typeof JsBarcode !== 'undefined') {
          JsBarcode("#barcode-svg", "${item.barcode || ''}", { width: 2, height: 60, fontSize: 16, displayValue: true });
          document.getElementById('fallback').style.display = 'none';
          setTimeout(function() { window.print(); window.close(); }, 400);
        } else {
          showError('Barcode library failed to load.');
        }
      } catch (e) {
        showError('Error: ' + e.message);
      }
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
    script.onload = renderBarcode;
    script.onerror = function() { showError('Failed to load barcode library.'); };
    document.head.appendChild(script);
  </script>
</body>
</html>`;
    const printWindow = window.open('', '', 'width=400,height=300');
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[350px] relative flex flex-col items-center">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <div ref={barcodeRef} className="barcode-label w-full flex flex-col items-center">
          <div className="name">{item.item_name}</div>
          <div className="barcode">
            <Barcode value={item.barcode || ""} width={2} height={60} fontSize={16} displayValue={true} />
          </div>
        </div>
        <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handlePrint}>Print</button>
      </div>
    </div>
  );
}
