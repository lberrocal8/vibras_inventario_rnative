// screens/PrendaFormScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused, useRoute } from '@react-navigation/native';
import { TextInput, Button, Dialog, Portal, PaperProvider, Text } from 'react-native-paper';

type RootStackParamList = {
  PrendaForm: undefined;
  ScanBarcode: { onScan: (codigo: string) => void };
};

type Props = NativeStackScreenProps<RootStackParamList, 'PrendaForm'>;

export default function PrendaFormScreen({ navigation }: Props) {
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [visibleModalPermission, setVisibleModalPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const route = useRoute();

  // Dropdown for tallas
  const [openDDTallas, setOpenDDTallas] = useState(false);
  const [valueDDTallas, setValueDDTallas] = useState([]);
  const [itemsDDTallas, setItemsDDTallas] = useState([
    { label: 'S', value: 's' },
    { label: 'M', value: 'm' },
    { label: 'L', value: 'l' },
  ]);

  // Dropdown for colores
  const [openDDColores, setOpenDDColores] = useState(false);
  const [valueDDColores, setValueDDColores] = useState([]);
  const [itemsDDColores, setItemsDDColores] = useState([
    { label: 'Rojo', value: 'rojo' },
    { label: 'Verde', value: 'verde' },
    { label: 'Azul', value: 'azul' },
  ]);

  const [form, setForm] = useState({
    barCode: '',
    nombre_prenda: '',
    tipo_tela: '',
    tallas_disponibles: '',
    colores_disponibles: '',
    cantidad_entrante: '',
    genero_objetivo: '',
    estado_prenda: ''
  });

  const showDialogPermission = () => setVisibleModalPermission(true);
  const hideDialogPermission = () => setVisibleModalPermission(false);

  const setField = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (!permission) { // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) { // Camera permissions are not granted yet.
    return (
      <PaperProvider>
        <View>
          <Button onPress={showDialogPermission}>Show Dialog</Button>
          <Portal>
            <Dialog visible={visibleModalPermission} onDismiss={hideDialogPermission}>
              <Dialog.Title>Conceder permiso</Dialog.Title>
              <Dialog.Content>
                <Text variant="bodyMedium">Es necesario el permiso de la camara para utilizar la aplicación</Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={hideDialogPermission}>Ok</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </View>
      </PaperProvider>
    );
  }

  const handleBarCodeScanned = (codes: BarcodeScanningResult[]) => {
    if (scanned || codes.length === 0) return;
    setScanned(true);

    const data = codes[0].data;
    console.log('Código escaneado:', data);
    setField('barCode', data);
    setShowCamera(false);

    setTimeout(() => setScanned(false), 500);
  };

  const guardarPrenda = () => {
    fetch('http://192.168.20.242:3010/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Respuesta del servidor:', data);
        Alert.alert('Éxito', 'Prenda guardada correctamente.');
      })
      .catch(error => {
        console.error('Error al guardar la prenda:', error);
        Alert.alert('Error', 'No se pudo guardar la prenda. Intenta nuevamente.');
      });
  };

  const verProductos = async () => {
    fetch('http://192.168.20.242:3010/api/products')
      .then(response => response.json())
      .then(data => {
        console.log('Productos:', data);
        Alert.alert('Productos', JSON.stringify(data.message));
      })
      .catch(error => {
        console.error('Error al obtener los productos:', error);
        Alert.alert('Error', 'No se pudo obtener los productos. Intenta nuevamente.');
      });
  };

  if (showCamera) { // Show camera view
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
          <Button onPress={() => setShowCamera(false)} mode='contained'>Cerrar</Button>
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
        <TextInput label={'Código'} value={form.barCode} onChangeText={text => setField('barCode', text)} mode='outlined' right={<TextInput.Icon onPress={() => setShowCamera(true)} icon="camera" />} />
        <TextInput label={'Nombre de la prenda'} value={form.nombre_prenda} onChangeText={text => setField('nombre_prenda', text)} mode='outlined' />
        <View style={styles.container}>
          <Text style={styles.title}>HStack con Scroll:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.hstack}>
              {Array.from({ length: 10 }).map((_, index) => (
                <TouchableOpacity key={index} style={styles.item}>
                  <Text style={styles.itemText}>Item {index + 1}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        <TextInput label={'Tallas disponibles'} value={form.tallas_disponibles} onChangeText={text => setField('tallas_disponibles', text)} mode='outlined' />
        <TextInput label={'Tipo de tela'} value={form.tipo_tela} onChangeText={text => setField('tipo_tela', text)} mode='outlined' />
        <TextInput label={'Colores disponibles'} value={form.colores_disponibles} onChangeText={text => setField('colores_disponibles', text)} mode='outlined' />
        <TextInput label={'Cantidad entrante'} value={form.cantidad_entrante} onChangeText={text => setField('cantidad_entrante', text)} mode='outlined' keyboardType="numeric" />
        <TextInput label={'Género objetivo'} value={form.genero_objetivo} onChangeText={text => setField('genero_objetivo', text)} mode='outlined' />
        <TextInput label={'Estado prenda'} value={form.estado_prenda} onChangeText={text => setField('estado_prenda', text)} mode='outlined' />
      </View>
      <View style={styles.containerButtons}>
        <Button onPress={verProductos} mode='contained'>Ver productos</Button>
        <Button onPress={guardarPrenda} mode='contained'>Guardar</Button>
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
  hstack: {
    flexDirection: 'row',
    gap: 10, // solo funciona en versiones nuevas; puedes usar marginRight/marginLeft como alternativa
  },
  item: {
    padding: 15,
    backgroundColor: '#2196f3',
    borderRadius: 10,
    marginRight: 10,
  },
  itemText: {
    color: 'white',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    gap: 4,
    marginTop: 40,
    width: '100%',
  },
  containerControls: {
    gap: 5,
    width: '100%',
  },
  containerButtons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
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
