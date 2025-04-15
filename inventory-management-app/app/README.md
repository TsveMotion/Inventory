# Inventory Scanner Android App

This is a minimal Expo React Native app for scanning inventory barcodes in and out, designed to work with your FastAPI backend.

## Features
- Scan barcodes using your phone's camera
- Two buttons: Scan In and Scan Out
- Sends barcode and action to your backend API

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm start
   ```
3. **Install the Expo Go app** from Google Play on your Android phone.
4. **Scan the QR code** in your terminal/browser with Expo Go to open the app instantly.

## Configuration
- Edit `App.js` to set your backend API endpoint (`fetch('http://YOUR_SERVER_IP/api/scan', ...)`).

## Building a real APK
- See the Expo docs for [building a standalone APK](https://docs.expo.dev/classic/building-standalone-apps/).

---

**This app is for internal use and quick inventory management via barcode scanning.**
