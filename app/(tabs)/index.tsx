// screens/PrendaFormScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused, useRoute } from '@react-navigation/native';
import axios from 'axios';

type RootStackParamList = {
  PrendaForm: undefined;
  ScanBarcode: { onScan: (codigo: string) => void };
};

type Props = NativeStackScreenProps<RootStackParamList, 'PrendaForm'>;

export default function PrendaFormScreen({ navigation }: Props) {
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [talla, setTalla] = useState('');
  const [color, setColor] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const route = useRoute();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const handleBarCodeScanned = (codes: BarcodeScanningResult[]) => {
    if (scanned || codes.length === 0) return;
    setScanned(true);

    const data = codes[0].data;
    setCodigo(data);
    setShowCamera(false);

    setTimeout(() => setScanned(false), 500);
  };

  const guardarPrenda = async () => {
    try {
      await axios.post('https://tuapi.com/prendas', {
        codigo,
        descripcion,
        talla,
        color,
      });
      alert('Prenda guardada');
      navigation.goBack();
    } catch (err) {
      alert('Error al guardar');
    }
  };

  if (showCamera) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing={'back'}
          barcodeScannerSettings={{
            barcodeTypes: ['code128', 'ean13', 'ean8', 'qr'],
          }}
          onBarcodeScanned={({ data }) =>
            handleBarCodeScanned([
              {
                data,
                type: '',
                cornerPoints: [],
                bounds: {
                  origin: { x: 0, y: 0 },
                  size: { width: 0, height: 0 },
                },
              },
            ])
          }
        />
        <View style={styles.cameraOverlay}>
          <TouchableOpacity style={styles.button} onPress={() => setShowCamera(false)}>
            <Text style={styles.text}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Ingresar prendas</Text>
        <Text style={styles.subtitle}>Ingresa los siguientes datos o escanea el código de barras en la prenda para ingresarla al inventario.</Text>
      </View>
      <View style={styles.containerControls}>
        <Text>Código:</Text>
        <TextInput style={styles.input} value={codigo} onChangeText={setCodigo} />
      </View>
      <View style={styles.containerControls}>
        <Text>Descripción:</Text>
        <TextInput style={styles.input} value={descripcion} onChangeText={setDescripcion} />
      </View>
      <View style={styles.containerControls}>
        <Text>Talla:</Text>
        <TextInput style={styles.input} value={talla} onChangeText={setTalla} />
      </View>
      <View style={styles.containerControls}>
        <Text>Color:</Text>
        <TextInput style={styles.input} value={color} onChangeText={setColor} />
      </View>

      <View style={styles.viewButtons}>
        <Button title="Guardar" onPress={guardarPrenda} />
        <Button title="Escanear código" onPress={() => setShowCamera(true)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraOverlay: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  container: {
    padding: 20,
    gap: 4,
    marginTop: 40,
  },
  containerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewButtons: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginVertical: 5,
    width: 250,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#020618',
  },
  subtitle: {
    color: '#45556c',
    marginBottom: 20,
  }
});
