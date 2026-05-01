import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ScreenGestion({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Tienda</Text>
        <Text style={styles.subtitle}>Panel principal</Text>
      </View>

      {/* Main Options */}
      <View style={styles.grid}>

        {/* Gestión de Productos */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ScreenGestionProductos')}
        >
          <MaterialIcons name="inventory" size={40} color="#2E86DE" />
          <Text style={styles.cardTitle}>Productos</Text>
          <Text style={styles.cardText}>
            Administración general de productos
          </Text>
        </TouchableOpacity>

        {/* Productos por Peso */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Recetas')}
        >
          <MaterialIcons name="scale" size={40} color="#27AE60" />
          <Text style={styles.cardTitle}>Productos por Kg</Text>
          <Text style={styles.cardText}>
            Gestión de recetas y producción
          </Text>
        </TouchableOpacity>

        {/* Alertas */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Alertas')}
        >
          <MaterialIcons name="warning" size={40} color="#E74C3C" />
          <Text style={styles.cardTitle}>Alertas</Text>
          <Text style={styles.cardText}>
            Inventario y proveedores
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F7',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 5,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
  card: {
    width: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#2C3E50',
  },
  cardText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 5,
  },
});