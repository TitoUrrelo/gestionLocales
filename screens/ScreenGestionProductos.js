import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

// ─── Datos de ejemplo ────────────────────────────────────────────────────────

const PRODUCTOS_INICIALES = [
  {
    id: '1',
    nombre: 'Arroz Premium 1kg',
    codigo: '7891234560012',
    categoria: 'Abarrotes',
    proveedor: 'Distribuidora Norte',
    precio: 1290,
    stock: 142,
    minimo: 30,
    ubicacion: 'Pasillo A - Est. 2',
    ultima: '28 abr 2025',
  },
  {
    id: '2',
    nombre: 'Aceite Vegetal 1L',
    codigo: '7802800100036',
    categoria: 'Abarrotes',
    proveedor: 'Alimarket SpA',
    precio: 2450,
    stock: 18,
    minimo: 20,
    ubicacion: 'Pasillo A - Est. 3',
    ultima: '25 abr 2025',
  },
  {
    id: '3',
    nombre: 'Leche Entera 1L',
    codigo: '7802800200018',
    categoria: 'Lácteos',
    proveedor: 'Colún',
    precio: 990,
    stock: 0,
    minimo: 40,
    ubicacion: 'Frío - Est. 1',
    ultima: '29 abr 2025',
  },
  {
    id: '4',
    nombre: 'Detergente 1kg',
    codigo: '4005808224067',
    categoria: 'Limpieza',
    proveedor: 'Procter & Gamble',
    precio: 3800,
    stock: 55,
    minimo: 15,
    ubicacion: 'Pasillo C - Est. 1',
    ultima: '20 abr 2025',
  },
  {
    id: '5',
    nombre: 'Agua Mineral 1.5L',
    codigo: '7802800050014',
    categoria: 'Bebidas',
    proveedor: 'Vital',
    precio: 650,
    stock: 210,
    minimo: 50,
    ubicacion: 'Pasillo B - Est. 4',
    ultima: '27 abr 2025',
  },
];

const HISTORIALES = {
  '1': [
    { tipo: 'Ingreso de mercadería', fecha: '28 abr 2025', qty: '+50', pos: true },
    { tipo: 'Ajuste de inventario', fecha: '15 abr 2025', qty: '-3', pos: false },
    { tipo: 'Ingreso de mercadería', fecha: '01 abr 2025', qty: '+100', pos: true },
  ],
  '2': [
    { tipo: 'Ingreso de mercadería', fecha: '25 abr 2025', qty: '+30', pos: true },
    { tipo: 'Ajuste de inventario', fecha: '10 abr 2025', qty: '-2', pos: false },
  ],
  '3': [
    { tipo: 'Ingreso de mercadería', fecha: '29 abr 2025', qty: '+80', pos: true },
    { tipo: 'Devolución cliente', fecha: '18 abr 2025', qty: '+5', pos: true },
  ],
  '4': [{ tipo: 'Ingreso de mercadería', fecha: '20 abr 2025', qty: '+40', pos: true }],
  '5': [
    { tipo: 'Ingreso de mercadería', fecha: '27 abr 2025', qty: '+200', pos: true },
    { tipo: 'Ajuste de inventario', fecha: '05 abr 2025', qty: '-10', pos: false },
  ],
};

const CATEGORIAS = ['Abarrotes', 'Lácteos', 'Bebidas', 'Limpieza', 'Otros'];
const TIPOS_MOVIMIENTO = ['Ingreso de mercadería', 'Ajuste de inventario', 'Devolución de cliente'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStockStatus(stock, minimo) {
  if (stock === 0) return 'out';
  if (stock <= minimo) return 'low';
  return 'ok';
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ScreenGestionProductos() {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const [productos, setProductos] = useState(PRODUCTOS_INICIALES);
  const [busqueda, setBusqueda] = useState('');

  // Modales
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalActualizar, setModalActualizar] = useState(false);
  const [modalRegistrar, setModalRegistrar] = useState(false);

  // Producto seleccionado
  const [productoActual, setProductoActual] = useState(null);

  // Formulario editar
  const [editNombre, setEditNombre] = useState('');
  const [editPrecio, setEditPrecio] = useState('');
  const [editMinimo, setEditMinimo] = useState('');
  const [editProveedor, setEditProveedor] = useState('');
  const [editUbicacion, setEditUbicacion] = useState('');

  // Formulario actualizar stock
  const [updCodigo, setUpdCodigo] = useState('');
  const [updCantidad, setUpdCantidad] = useState('');
  const [updTipo, setUpdTipo] = useState(TIPOS_MOVIMIENTO[0]);

  // Formulario registrar
  const [regCodigo, setRegCodigo] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regCategoria, setRegCategoria] = useState(CATEGORIAS[0]);
  const [regProveedor, setRegProveedor] = useState('');
  const [regPrecio, setRegPrecio] = useState('');
  const [regStock, setRegStock] = useState('');
  const [regMinimo, setRegMinimo] = useState('');
  const [regUbicacion, setRegUbicacion] = useState('');

  // ── Filtrado ────────────────────────────────────────────────────────────────
  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.includes(busqueda)
  );

  // ── Acciones ────────────────────────────────────────────────────────────────
  function abrirDetalle(producto) {
    setProductoActual(producto);
    setModalDetalle(true);
  }

  function abrirEditar() {
    setEditNombre(productoActual.nombre);
    setEditPrecio(String(productoActual.precio));
    setEditMinimo(String(productoActual.minimo));
    setEditProveedor(productoActual.proveedor);
    setEditUbicacion(productoActual.ubicacion);
    setModalEditar(true);
  }

  function guardarEdicion() {
    if (!editNombre.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }
    const actualizado = {
      ...productoActual,
      nombre: editNombre.trim(),
      precio: parseInt(editPrecio) || productoActual.precio,
      minimo: parseInt(editMinimo) || productoActual.minimo,
      proveedor: editProveedor.trim() || productoActual.proveedor,
      ubicacion: editUbicacion.trim() || productoActual.ubicacion,
    };
    setProductos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
    setProductoActual(actualizado);
    setModalEditar(false);
    Alert.alert('Listo', 'Producto actualizado correctamente');
  }

  // Simula escaneo de pistola (en producción: usar expo-barcode-scanner)
  function simularEscaneo(contexto) {
    if (contexto === 'actualizar') {
      setUpdCodigo('7891234560012');
      Alert.alert('Escaneado', 'Código: 7891234560012 — Arroz Premium 1kg');
    } else {
      setRegCodigo('4005808224067');
      Alert.alert('Escaneado', 'Código: 4005808224067 detectado');
    }
  }

  function confirmarActualizacion() {
    if (!updCodigo.trim() || !updCantidad.trim()) {
      Alert.alert('Error', 'Ingresa código y cantidad');
      return;
    }
    const cantidad = parseInt(updCantidad);
    if (isNaN(cantidad) || cantidad <= 0) {
      Alert.alert('Error', 'La cantidad debe ser mayor a 0');
      return;
    }
    setProductos((prev) =>
      prev.map((p) =>
        p.codigo === updCodigo.trim() ? { ...p, stock: p.stock + cantidad } : p
      )
    );
    setUpdCodigo('');
    setUpdCantidad('');
    setModalActualizar(false);
    Alert.alert('Listo', `+${cantidad} unidades agregadas al stock`);
  }

  function guardarProducto() {
    if (!regCodigo.trim() || !regNombre.trim()) {
      Alert.alert('Error', 'Código y nombre son obligatorios');
      return;
    }
    const existe = productos.find((p) => p.codigo === regCodigo.trim());
    if (existe) {
      Alert.alert('Error', 'Ya existe un producto con ese código');
      return;
    }
    const nuevo = {
      id: String(Date.now()),
      nombre: regNombre.trim(),
      codigo: regCodigo.trim(),
      categoria: regCategoria,
      proveedor: regProveedor.trim() || 'Sin proveedor',
      precio: parseInt(regPrecio) || 0,
      stock: parseInt(regStock) || 0,
      minimo: parseInt(regMinimo) || 10,
      ubicacion: regUbicacion.trim() || 'Sin asignar',
      ultima: new Date().toLocaleDateString('es-CL'),
    };
    setProductos((prev) => [nuevo, ...prev]);
    setRegCodigo(''); setRegNombre(''); setRegProveedor('');
    setRegPrecio(''); setRegStock(''); setRegMinimo(''); setRegUbicacion('');
    setModalRegistrar(false);
    Alert.alert('Listo', `"${nuevo.nombre}" registrado correctamente`);
  }

  // ── Render tarjeta de producto ───────────────────────────────────────────────
  function renderProducto({ item }) {
    const status = getStockStatus(item.stock, item.minimo);
    return (
      <TouchableOpacity style={s.card} onPress={() => abrirDetalle(item)} activeOpacity={0.75}>
        <View style={s.cardIcon}>
          <Text style={s.cardIconText}>📦</Text>
        </View>
        <View style={s.cardInfo}>
          <Text style={s.cardNombre} numberOfLines={1}>{item.nombre}</Text>
          <Text style={s.cardCodigo}>{item.codigo}</Text>
          <View style={[s.badge, s[`badge_${status}`]]}>
            <Text style={[s.badgeText, s[`badgeText_${status}`]]}>
              {status === 'ok' ? 'Disponible' : status === 'low' ? 'Stock bajo' : 'Sin stock'}
            </Text>
          </View>
        </View>
        <View style={s.cardRight}>
          <Text style={s.stockNum}>{item.stock}</Text>
          <Text style={s.stockLbl}>uds.</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>

      {/* Header */}
      <View style={s.topbar}>
        <View>
          <Text style={s.topbarTitle}>Gestión de productos</Text>
          <Text style={s.topbarSub}>{productosFiltrados.length} productos</Text>
        </View>
      </View>

      {/* Buscador */}
      <View style={s.searchWrap}>
        <TextInput
          style={s.searchInput}
          placeholder="Buscar por nombre o código..."
          placeholderTextColor={colors.placeholder}
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* Lista */}
      <FlatList
        data={productosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderProducto}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FABs */}
      <View style={s.fabRow}>
        <TouchableOpacity style={[s.fab, s.fabUpdate]} onPress={() => setModalActualizar(true)} activeOpacity={0.85}>
          <Text style={s.fabUpdateText}>↑  Actualizar stock</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.fab, s.fabRegister]} onPress={() => setModalRegistrar(true)} activeOpacity={0.85}>
          <Text style={s.fabRegisterText}>+  Registrar producto</Text>
        </TouchableOpacity>
      </View>

      {/* ── Modal: Detalle ─────────────────────────────────────────────────── */}
      <Modal visible={modalDetalle} animationType="slide" transparent onRequestClose={() => setModalDetalle(false)}>
        <Pressable style={s.overlay} onPress={() => setModalDetalle(false)}>
          <Pressable style={s.bottomSheet} onPress={() => {}}>
            <View style={s.handle} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle} numberOfLines={1}>{productoActual?.nombre}</Text>
              <TouchableOpacity onPress={() => setModalDetalle(false)}><Text style={s.closeBtn}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {productoActual && (
                <>
                  {/* Stats */}
                  <View style={s.statsGrid}>
                    {[
                      { label: 'Stock actual', value: String(productoActual.stock), sub: 'unidades' },
                      { label: 'Precio unitario', value: '$' + productoActual.precio.toLocaleString('es-CL'), sub: 'CLP' },
                      { label: 'Categoría', value: productoActual.categoria },
                      { label: 'Proveedor', value: productoActual.proveedor },
                    ].map((item, i) => (
                      <View key={i} style={s.statCard}>
                        <Text style={s.statLabel}>{item.label}</Text>
                        <Text style={s.statValue} numberOfLines={2}>{item.value}</Text>
                        {item.sub && <Text style={s.statSub}>{item.sub}</Text>}
                      </View>
                    ))}
                  </View>

                  {/* Datos adicionales */}
                  <View style={s.infoBlock}>
                    <Text style={s.blockTitle}>Datos adicionales</Text>
                    {[
                      { k: 'Código', v: productoActual.codigo },
                      { k: 'Ubicación', v: productoActual.ubicacion },
                      { k: 'Stock mínimo', v: productoActual.minimo + ' uds.' },
                      { k: 'Última actualización', v: productoActual.ultima },
                    ].map((row, i) => (
                      <View key={i} style={s.infoRow}>
                        <Text style={s.infoKey}>{row.k}</Text>
                        <Text style={s.infoVal} numberOfLines={1}>{row.v}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Historial */}
                  <View style={s.infoBlock}>
                    <Text style={s.blockTitle}>Historial de ingresos</Text>
                    {(HISTORIALES[productoActual.id] || []).map((h, i) => (
                      <View key={i} style={s.histRow}>
                        <View style={[s.histDot, h.pos ? s.histDotIn : s.histDotAdj]} />
                        <View style={s.histInfo}>
                          <Text style={s.histTipo}>{h.tipo}</Text>
                          <Text style={s.histFecha}>{h.fecha}</Text>
                        </View>
                        <Text style={h.pos ? s.histPos : s.histNeg}>{h.qty} uds.</Text>
                      </View>
                    ))}
                  </View>

                  {/* Botón editar */}
                  <TouchableOpacity style={s.editBtn} onPress={abrirEditar} activeOpacity={0.75}>
                    <Text style={s.editBtnText}>✎  Editar datos del producto</Text>
                  </TouchableOpacity>
                  <View style={{ height: 20 }} />
                </>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Modal: Editar ──────────────────────────────────────────────────── */}
      <Modal visible={modalEditar} animationType="slide" transparent onRequestClose={() => setModalEditar(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={s.overlay} onPress={() => setModalEditar(false)}>
            <Pressable style={s.bottomSheet} onPress={() => {}}>
              <View style={s.handle} />
              <View style={s.sheetHeader}>
                <Text style={s.sheetTitle}>Editar producto</Text>
                <TouchableOpacity onPress={() => setModalEditar(false)}><Text style={s.closeBtn}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={s.formWrap}>
                  <FormField label="Nombre" value={editNombre} onChangeText={setEditNombre} placeholder="Nombre del producto" colors={colors} s={s} />
                  <FormField label="Precio unitario ($)" value={editPrecio} onChangeText={setEditPrecio} placeholder="Ej: 1290" keyboardType="numeric" colors={colors} s={s} />
                  <FormField label="Stock mínimo" value={editMinimo} onChangeText={setEditMinimo} placeholder="Ej: 20" keyboardType="numeric" colors={colors} s={s} />
                  <FormField label="Proveedor" value={editProveedor} onChangeText={setEditProveedor} placeholder="Nombre del proveedor" colors={colors} s={s} />
                  <FormField label="Ubicación en bodega" value={editUbicacion} onChangeText={setEditUbicacion} placeholder="Ej: Pasillo A - Est. 2" colors={colors} s={s} />
                  <TouchableOpacity style={s.btnPrimary} onPress={guardarEdicion} activeOpacity={0.85}>
                    <Text style={s.btnPrimaryText}>Guardar cambios</Text>
                  </TouchableOpacity>
                  <View style={{ height: 20 }} />
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Modal: Actualizar stock ────────────────────────────────────────── */}
      <Modal visible={modalActualizar} animationType="slide" transparent onRequestClose={() => setModalActualizar(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={s.overlay} onPress={() => setModalActualizar(false)}>
            <Pressable style={s.bottomSheet} onPress={() => {}}>
              <View style={s.handle} />
              <View style={s.sheetHeader}>
                <Text style={s.sheetTitle}>Actualizar stock</Text>
                <TouchableOpacity onPress={() => setModalActualizar(false)}><Text style={s.closeBtn}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={s.formWrap}>
                  {/* Botón escanear */}
                  <TouchableOpacity style={s.scanBox} onPress={() => simularEscaneo('actualizar')} activeOpacity={0.75}>
                    <Text style={s.scanIcon}>▦</Text>
                    <Text style={s.scanTitle}>Escanear código de barras</Text>
                    <Text style={s.scanSub}>Usa la pistola o toca para simular</Text>
                  </TouchableOpacity>

                  <Text style={s.orDivider}>— o ingresa manualmente —</Text>

                  <FormField label="Código de barras" value={updCodigo} onChangeText={setUpdCodigo} placeholder="Ej: 7891234560012" keyboardType="numeric" colors={colors} s={s} />
                  <FormField label="Cantidad a ingresar" value={updCantidad} onChangeText={setUpdCantidad} placeholder="Ej: 50" keyboardType="numeric" colors={colors} s={s} />

                  <View style={s.formGroup}>
                    <Text style={s.formLabel}>TIPO DE MOVIMIENTO</Text>
                    <View style={s.selectWrap}>
                      {TIPOS_MOVIMIENTO.map((tipo) => (
                        <TouchableOpacity
                          key={tipo}
                          style={[s.selectOption, updTipo === tipo && s.selectOptionActive]}
                          onPress={() => setUpdTipo(tipo)}
                        >
                          <Text style={[s.selectOptionText, updTipo === tipo && s.selectOptionTextActive]}>
                            {tipo}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity style={s.btnPrimary} onPress={confirmarActualizacion} activeOpacity={0.85}>
                    <Text style={s.btnPrimaryText}>Confirmar actualización</Text>
                  </TouchableOpacity>
                  <View style={{ height: 20 }} />
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Modal: Registrar producto ──────────────────────────────────────── */}
      <Modal visible={modalRegistrar} animationType="slide" transparent onRequestClose={() => setModalRegistrar(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={s.overlay} onPress={() => setModalRegistrar(false)}>
            <Pressable style={s.bottomSheet} onPress={() => {}}>
              <View style={s.handle} />
              <View style={s.sheetHeader}>
                <Text style={s.sheetTitle}>Registrar producto</Text>
                <TouchableOpacity onPress={() => setModalRegistrar(false)}><Text style={s.closeBtn}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={s.formWrap}>
                  {/* Botón escanear */}
                  <TouchableOpacity style={s.scanBox} onPress={() => simularEscaneo('registrar')} activeOpacity={0.75}>
                    <Text style={s.scanIcon}>▦</Text>
                    <Text style={s.scanTitle}>Escanear código de barras</Text>
                    <Text style={s.scanSub}>Usa la pistola o toca para simular</Text>
                  </TouchableOpacity>

                  <Text style={s.orDivider}>— o ingresa manualmente —</Text>

                  <FormField label="Código de barras *" value={regCodigo} onChangeText={setRegCodigo} placeholder="Ej: 4005808224067" keyboardType="numeric" colors={colors} s={s} />
                  <FormField label="Nombre del producto *" value={regNombre} onChangeText={setRegNombre} placeholder="Ej: Aceite oliva 500ml" colors={colors} s={s} />

                  <View style={s.formGroup}>
                    <Text style={s.formLabel}>CATEGORÍA</Text>
                    <View style={s.selectWrap}>
                      {CATEGORIAS.map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[s.selectOption, regCategoria === cat && s.selectOptionActive]}
                          onPress={() => setRegCategoria(cat)}
                        >
                          <Text style={[s.selectOptionText, regCategoria === cat && s.selectOptionTextActive]}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <FormField label="Proveedor" value={regProveedor} onChangeText={setRegProveedor} placeholder="Ej: Distribuidora Norte" colors={colors} s={s} />
                  <FormField label="Precio unitario ($)" value={regPrecio} onChangeText={setRegPrecio} placeholder="Ej: 1290" keyboardType="numeric" colors={colors} s={s} />
                  <FormField label="Stock inicial" value={regStock} onChangeText={setRegStock} placeholder="Ej: 100" keyboardType="numeric" colors={colors} s={s} />
                  <FormField label="Stock mínimo" value={regMinimo} onChangeText={setRegMinimo} placeholder="Ej: 20" keyboardType="numeric" colors={colors} s={s} />
                  <FormField label="Ubicación en bodega" value={regUbicacion} onChangeText={setRegUbicacion} placeholder="Ej: Pasillo A - Estante 3" colors={colors} s={s} />

                  <TouchableOpacity style={s.btnPrimary} onPress={guardarProducto} activeOpacity={0.85}>
                    <Text style={s.btnPrimaryText}>Guardar producto</Text>
                  </TouchableOpacity>
                  <View style={{ height: 20 }} />
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

// ─── Componente auxiliar FormField ────────────────────────────────────────────

function FormField({ label, value, onChangeText, placeholder, keyboardType = 'default', colors, s }) {
  return (
    <View style={s.formGroup}>
      <Text style={s.formLabel}>{label}</Text>
      <TextInput
        style={s.formInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const makeStyles = (c) =>
  StyleSheet.create({
    container:        { flex: 1, backgroundColor: c.bg },

    // Topbar
    topbar:           { backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border, paddingHorizontal: 16, paddingVertical: 14 },
    topbarTitle:      { fontSize: 16, fontWeight: '600', color: c.textPrimary },
    topbarSub:        { fontSize: 12, color: c.textSecondary, marginTop: 1 },

    // Buscador
    searchWrap:       { backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border, paddingHorizontal: 12, paddingVertical: 10 },
    searchInput:      { backgroundColor: c.surface2, borderWidth: 0.5, borderColor: c.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: c.textPrimary },

    // Lista
    listContent:      { padding: 12, paddingBottom: 90, gap: 8 },

    // Tarjeta producto
    card:             { backgroundColor: c.surface, borderWidth: 0.5, borderColor: c.border, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardIcon:         { width: 38, height: 38, borderRadius: 10, backgroundColor: '#E6F1FB', alignItems: 'center', justifyContent: 'center' },
    cardIconText:     { fontSize: 16 },
    cardInfo:         { flex: 1 },
    cardNombre:       { fontSize: 14, fontWeight: '500', color: c.textPrimary },
    cardCodigo:       { fontSize: 11, color: c.textSecondary, marginTop: 1 },
    cardRight:        { alignItems: 'flex-end' },
    stockNum:         { fontSize: 15, fontWeight: '600', color: c.textPrimary },
    stockLbl:         { fontSize: 11, color: c.textSecondary },

    // Badges
    badge:            { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
    badge_ok:         { backgroundColor: '#EAF3DE' },
    badge_low:        { backgroundColor: '#FAEEDA' },
    badge_out:        { backgroundColor: '#FCEBEB' },
    badgeText:        { fontSize: 10, fontWeight: '500' },
    badgeText_ok:     { color: '#27500A' },
    badgeText_low:    { color: '#633806' },
    badgeText_out:    { color: '#791F1F' },

    // FABs
    fabRow:           { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 10, padding: 12, backgroundColor: c.surface, borderTopWidth: 0.5, borderTopColor: c.border },
    fab:              { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    fabUpdate:        { backgroundColor: c.btnBg },
    fabRegister:      { backgroundColor: '#E6F1FB', borderWidth: 0.5, borderColor: '#B5D4F4' },
    fabUpdateText:    { fontSize: 13, fontWeight: '600', color: c.btnText },
    fabRegisterText:  { fontSize: 13, fontWeight: '600', color: '#0C447C' },

    // Modal / Bottom Sheet
    overlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    bottomSheet:      { backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
    handle:           { width: 36, height: 4, backgroundColor: c.border, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
    sheetHeader:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: c.border },
    sheetTitle:       { fontSize: 15, fontWeight: '600', color: c.textPrimary, flex: 1 },
    closeBtn:         { fontSize: 18, color: c.textSecondary, paddingLeft: 12 },

    // Stats grid (detalle)
    statsGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12 },
    statCard:         { flex: 1, minWidth: '45%', backgroundColor: c.surface2, borderRadius: 10, padding: 10 },
    statLabel:        { fontSize: 11, color: c.textSecondary, marginBottom: 3 },
    statValue:        { fontSize: 16, fontWeight: '500', color: c.textPrimary },
    statSub:          { fontSize: 11, color: c.textSecondary },

    // Info block (detalle)
    infoBlock:        { marginHorizontal: 12, marginBottom: 10, borderWidth: 0.5, borderColor: c.border, borderRadius: 12, overflow: 'hidden' },
    blockTitle:       { fontSize: 12, fontWeight: '500', color: c.textSecondary, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: c.surface2, borderBottomWidth: 0.5, borderBottomColor: c.border },
    infoRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: c.border },
    infoKey:          { fontSize: 13, color: c.textSecondary },
    infoVal:          { fontSize: 13, color: c.textPrimary, fontWeight: '500', maxWidth: '55%', textAlign: 'right' },

    // Historial
    histRow:          { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: c.border },
    histDot:          { width: 8, height: 8, borderRadius: 4 },
    histDotIn:        { backgroundColor: '#639922' },
    histDotAdj:       { backgroundColor: '#BA7517' },
    histInfo:         { flex: 1 },
    histTipo:         { fontSize: 13, color: c.textPrimary },
    histFecha:        { fontSize: 11, color: c.textSecondary },
    histPos:          { fontSize: 13, fontWeight: '500', color: '#3B6D11' },
    histNeg:          { fontSize: 13, fontWeight: '500', color: '#A32D2D' },

    // Botón editar
    editBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginHorizontal: 12, marginTop: 4, borderWidth: 0.5, borderColor: c.border, borderRadius: 10, paddingVertical: 10 },
    editBtnText:      { fontSize: 13, color: c.textPrimary },

    // Formularios
    formWrap:         { padding: 16, gap: 12 },
    formGroup:        { gap: 5 },
    formLabel:        { fontSize: 11, fontWeight: '600', color: c.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase' },
    formInput:        { backgroundColor: c.surface2, borderWidth: 0.5, borderColor: c.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: c.textPrimary },

    // Scan box
    scanBox:          { backgroundColor: c.surface2, borderWidth: 1, borderColor: c.border, borderStyle: 'dashed', borderRadius: 12, padding: 18, alignItems: 'center' },
    scanIcon:         { fontSize: 28, color: c.textSecondary, marginBottom: 6 },
    scanTitle:        { fontSize: 14, fontWeight: '500', color: c.textPrimary },
    scanSub:          { fontSize: 12, color: c.textSecondary, marginTop: 2 },
    orDivider:        { textAlign: 'center', fontSize: 12, color: c.placeholder, marginVertical: 2 },

    // Select chips
    selectWrap:       { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
    selectOption:     { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 0.5, borderColor: c.border, backgroundColor: c.surface2 },
    selectOptionActive: { backgroundColor: c.btnBg, borderColor: c.btnBg },
    selectOptionText: { fontSize: 13, color: c.textSecondary },
    selectOptionTextActive: { color: c.btnText, fontWeight: '500' },

    // Botón primario
    btnPrimary:       { backgroundColor: c.btnBg, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
    btnPrimaryText:   { color: c.btnText, fontSize: 15, fontWeight: '600' },
  });