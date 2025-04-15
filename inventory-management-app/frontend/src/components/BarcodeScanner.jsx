import React, { useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onDetected, onClose }) {
  const scannerRef = useRef();
  const html5QrCodeRef = useRef();

  React.useEffect(() => {
    const scannerId = "barcode-scanner";
    html5QrCodeRef.current = new Html5Qrcode(scannerId);
    html5QrCodeRef.current.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        onDetected(decodedText);
        html5QrCodeRef.current.stop();
        onClose();
      },
      (error) => {}
    );
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current.clear();
      }
    };
  }, [onDetected, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={onClose}>&times;</button>
        <div className="mb-2 font-bold text-lg">Scan Barcode</div>
        <div id="barcode-scanner" ref={scannerRef} style={{ width: 300, height: 300 }} />
        <div className="mt-2 text-xs text-gray-500">Point your camera at a barcode</div>
      </div>
    </div>
  );
}
