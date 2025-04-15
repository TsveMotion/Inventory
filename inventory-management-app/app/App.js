import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [action, setAction] = useState(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanning(false);
    // TODO: Replace with your backend IP or domain
    fetch('http://YOUR_SERVER_IP/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, barcode: data }),
    })
      .then(res => res.json())
      .then(res => Alert.alert('Success', JSON.stringify(res)))
      .catch(e => Alert.alert('Error', e.message));
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  if (scanning) {
    return (
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, marginBottom: 40 }}>Inventory Scanner</Text>
      <Button title="Scan In" onPress={() => { setAction('in'); setScanning(true); }} />
      <View style={{ height: 20 }} />
      <Button title="Scan Out" onPress={() => { setAction('out'); setScanning(true); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
