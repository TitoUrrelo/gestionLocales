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
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

// ─── Datos de ejemplo ────────────────────────────────────────────────────────

const PRODUCTOS_INICIALES = [
  {
    id: '1',
    nombre: 'Arroz Premium',
    codigo: '7891234560012',
    categoria: 'Abarrotes',
    proveedor: 'Distribuidora Norte',
    precio: 890,      // $ por kg (1000g)
    stock: 142000,   // gramos
    minimo: 30000,
    unidad: 'g',
    activo: true,
    ultima: '28 abr 2025',
  },
  {
    id: '2',
    nombre: 'Aceite Vegetal',
    codigo: '7802800100036',
    categoria: 'Abarrotes',
    proveedor: 'Alimarket SpA',
    precio: 2450,
    stock: 18,
    minimo: 20,
    unidad: 'uds',
    activo: true,
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
    unidad: 'uds',
    activo: true,
    ultima: '29 abr 2025',
  },
  {
    id: '4',
    nombre: 'Detergente',
    codigo: '4005808224067',
    categoria: 'Limpieza',
    proveedor: 'Procter & Gamble',
    precio: 3800,
    stock: 55,
    minimo: 15,
    unidad: 'uds',
    activo: false,
    ultima: '20 abr 2025',
  },
  {
    id: '5',
    nombre: 'Queso Gauda',
    codigo: '7802800050014',
    categoria: 'Lácteos',
    proveedor: 'Soprole',
    precio: 12000,    // $ por kg (1000g)
    stock: 8500,    // gramos
    minimo: 2000,
    unidad: 'g',
    activo: true,
    ultima: '27 abr 2025',
  },
];

const HISTORIALES = {
  '1': [
    { tipo: 'Ingreso de mercadería', fecha: '28 abr 2025', qty: '+50000', pos: true },
    { tipo: 'Ingreso de mercadería', fecha: '01 abr 2025', qty: '+100000', pos: true },
  ],
  '2': [
    { tipo: 'Ingreso de mercadería', fecha: '25 abr 2025', qty: '+30', pos: true },
    { tipo: 'Devolución de cliente', fecha: '10 abr 2025', qty: '+2', pos: true },
  ],
  '3': [
    { tipo: 'Ingreso de mercadería', fecha: '29 abr 2025', qty: '+80', pos: true },
    { tipo: 'Devolución de cliente', fecha: '18 abr 2025', qty: '+5', pos: true },
  ],
  '4': [{ tipo: 'Ingreso de mercadería', fecha: '20 abr 2025', qty: '+40', pos: true }],
  '5': [
    { tipo: 'Ingreso de mercadería', fecha: '27 abr 2025', qty: '+10000', pos: true },
    { tipo: 'Devolución de cliente', fecha: '05 abr 2025', qty: '+500', pos: true },
  ],
};

const CATEGORIAS = ['Abarrotes', 'Lácteos', 'Bebidas', 'congelados', 'Limpieza', 'Otros'];
const TIPOS_MOVIMIENTO = ['Ingreso de mercadería', 'Devolución de cliente'];
// Categorías que NO requieren fecha de vencimiento
const CATEGORIAS_SIN_VENC = ['Limpieza', 'Otros'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStockStatus(stock, minimo) {
  if (stock === 0) return 'out';
  if (stock <= minimo) return 'low';
  return 'ok';
}

function formatStock(stock, unidad) {
  if (unidad === 'g') {
    if (stock >= 1000) return (stock / 1000).toFixed(2).replace(/\.?0+$/, '') + ' kg';
    return stock + ' g';
  }
  return stock + ' uds.';
}

function formatPrecio(precio, unidad) {
  const base = '$' + precio.toLocaleString('es-CL');
  return unidad === 'g' ? base + ' / kg' : base;
}

function requiereFechaVenc(categoria) {
  return !CATEGORIAS_SIN_VENC.includes(categoria);
}

function formatQtyHistorial(qty, unidad) {
  const sign = qty[0];
  const num = parseInt(qty.slice(1));
  if (unidad === 'g') {
    if (num >= 1000) return sign + (num / 1000).toFixed(2).replace(/\.?0+$/, '') + ' kg';
    return sign + num + ' g';
  }
  return qty + ' uds.';
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ScreenGestionProductos() {
  const { colors, isDark, toggle } = useTheme();
  const s = makeStyles(colors);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const overlayStyle = isDesktop ? s.overlayDesktop : s.overlay;
  const sheetStyle   = isDesktop ? s.bottomSheetDesktop : s.bottomSheet;

  const [productos, setProductos] = useState(PRODUCTOS_INICIALES);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState(null);
  const [filtroProveedor, setFiltroProveedor]   = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false); // 'categoria' | 'proveedor' | false

  // Modales
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalActualizar, setModalActualizar] = useState(false);
  const [modalRegistrar, setModalRegistrar] = useState(false);
  const [modalTransferir, setModalTransferir] = useState(false);

  // Producto seleccionado
  const [productoActual, setProductoActual] = useState(null);

  // Formulario editar
  const [editNombre, setEditNombre] = useState('');
  const [editPrecio, setEditPrecio] = useState('');
  const [editMinimo, setEditMinimo] = useState('');
  const [editProveedor, setEditProveedor] = useState('');

  // Formulario actualizar stock
  const [updCodigo, setUpdCodigo] = useState('');
  const [updCantidad, setUpdCantidad] = useState('');
  const [updTipo, setUpdTipo] = useState(TIPOS_MOVIMIENTO[0]);
  const [updLote, setUpdLote] = useState('');
  const [updFechaVenc, setUpdFechaVenc] = useState('');

  // Formulario transferencia
  const [transCantidad, setTransCantidad] = useState('');
  const [transLocal, setTransLocal] = useState('');

  // Formulario registrar
  const [regCodigo, setRegCodigo] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regCategoria, setRegCategoria] = useState(CATEGORIAS[0]);
  const [regProveedor, setRegProveedor] = useState('');
  const [regPrecio, setRegPrecio] = useState('');
  const [regStock, setRegStock] = useState('');
  const [regMinimo, setRegMinimo] = useState('');
  const [regUnidad, setRegUnidad] = useState('uds');

  const [regLote, setRegLote] = useState('');
  const [regFechaVenc, setRegFechaVenc] = useState('');


  // ── Filtrado ────────────────────────────────────────────────────────────────
  const proveedores = [...new Set(productos.map((p) => p.proveedor))];

  // Producto encontrado en modal actualizar (para condicionar campos)
  const productoUpdCodigo = productos.find((p) => p.codigo === updCodigo.trim()) || null;
  const updRequiereFechaVenc = productoUpdCodigo ? requiereFechaVenc(productoUpdCodigo.categoria) : true;

  const productosFiltrados = productos.filter((p) => {
    const matchBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.includes(busqueda);
    const matchCategoria = !filtroCategoria || p.categoria === filtroCategoria;
    const matchProveedor = !filtroProveedor || p.proveedor === filtroProveedor;
    return matchBusqueda && matchCategoria && matchProveedor;
  });

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
    if (!updLote.trim()) {
      Alert.alert('Error', 'El número de lote es obligatorio');
      return;
    }
    if (updRequiereFechaVenc && !updFechaVenc.trim()) {
      Alert.alert('Error', 'La fecha de vencimiento es obligatoria para esta categoría');
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
    setUpdLote('');
    setUpdFechaVenc('');
    setModalActualizar(false);
    Alert.alert('Listo', `+${cantidad} agregados al stock`);
  }

  function guardarProducto() {
    if (!regCodigo.trim() || !regNombre.trim()) {
      Alert.alert('Error', 'Código y nombre son obligatorios');
      return;
    }
    if (!regLote.trim()) {
      Alert.alert('Error', 'El número de lote es obligatorio');
      return;
    }
    if (requiereFechaVenc(regCategoria) && !regFechaVenc.trim()) {
      Alert.alert('Error', 'La fecha de vencimiento es obligatoria para esta categoría');
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
      unidad: regUnidad,
      activo: true,
      ultima: new Date().toLocaleDateString('es-CL'),
    };
    setProductos((prev) => [nuevo, ...prev]);
    setRegCodigo(''); setRegNombre(''); setRegProveedor('');
    setRegPrecio(''); setRegStock(''); setRegMinimo('');
    setRegLote(''); setRegFechaVenc(''); setRegUnidad('uds');
    setModalRegistrar(false);
    Alert.alert('Listo', `"${nuevo.nombre}" registrado correctamente`);
  }

  function toggleActivo() {
    const actualizado = { ...productoActual, activo: !productoActual.activo };
    setProductos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
    setProductoActual(actualizado);
  }

  function confirmarTransferencia() {
    if (!transCantidad.trim() || !transLocal.trim()) {
      Alert.alert('Error', 'Ingresa cantidad y local de destino');
      return;
    }
    const cant = parseInt(transCantidad);
    if (isNaN(cant) || cant <= 0) {
      Alert.alert('Error', 'La cantidad debe ser mayor a 0');
      return;
    }
    if (cant > productoActual.stock) {
      Alert.alert('Error', 'Stock insuficiente para la transferencia');
      return;
    }
    const actualizado = { ...productoActual, stock: productoActual.stock - cant };
    setProductos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
    setProductoActual(actualizado);
    setTransCantidad(''); setTransLocal('');
    setModalTransferir(false);
    Alert.alert('Transferencia realizada', `${cant} ${productoActual.unidad === 'g' ? 'g' : 'uds.'} enviados a "${transLocal}"`);
  }

  // ── Render tarjeta de producto ───────────────────────────────────────────────
  function renderProducto({ item }) {
    const status = getStockStatus(item.stock, item.minimo);
    const stockDisplay = formatStock(item.stock, item.unidad || 'uds');
    return (
      <TouchableOpacity style={[s.card, !item.activo && s.cardInactivo]} onPress={() => abrirDetalle(item)} activeOpacity={0.75}>
        <View style={s.cardIcon}>
          
        </View>
        <View style={s.cardInfo}>
          <Text style={s.cardNombre} numberOfLines={1}>{item.nombre}</Text>
          <Text style={s.cardCodigo}>{item.codigo}</Text>
          {item.activo ? (
            <View style={[s.badge, s[`badge_${status}`]]}>
              <Text style={[s.badgeText, s[`badgeText_${status}`]]}>
                {status === 'ok' ? 'Disponible' : status === 'low' ? 'Stock bajo' : 'Sin stock'}
              </Text>
            </View>
          ) : (
            <View style={[s.badge, s.badge_inactive]}>
              <Text style={[s.badgeText, s.badgeText_inactive]}>Inactivo</Text>
            </View>
          )}
        </View>
        <View style={s.cardRight}>
          <Text style={s.stockNum}>{item.unidad === 'g'
            ? (item.stock >= 1000 ? (item.stock / 1000).toFixed(1) : item.stock)
            : item.stock}</Text>
          <Text style={s.stockLbl}>{item.unidad === 'g' ? (item.stock >= 1000 ? 'kg' : 'g') : 'uds.'}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  function DetalleContenido() {
    if (!productoActual) return null;
    const stockLabel = formatStock(productoActual.stock, productoActual.unidad || 'uds');
    const minimoLabel = formatStock(productoActual.minimo, productoActual.unidad || 'uds');
    return (
      <>
        {/* Stats */}
        <View style={s.statsGrid}>
          {[
            { label: 'Stock actual', value: stockLabel, sub: productoActual.unidad === 'g' ? 'peso' : 'unidades' },
            { label: productoActual.unidad === 'g' ? 'Precio por kg' : 'Precio unitario', value: formatPrecio(productoActual.precio, productoActual.unidad || 'uds'), sub: 'CLP' },
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
            { k: 'Stock mínimo', v: minimoLabel },
            { k: 'Tipo de stock', v: productoActual.unidad === 'g' ? 'Por peso (gramos/kg)' : 'Por unidad' },
            { k: 'Última actualización', v: productoActual.ultima },
          ].map((row, i) => (
            <View key={i} style={s.infoRow}>
              <Text style={s.infoKey}>{row.k}</Text>
              <Text style={s.infoVal} numberOfLines={1}>{row.v}</Text>
            </View>
          ))}
        </View>

        {/* Switch estado activo */}
        <View style={s.infoBlock}>
          <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.infoKey}>Estado del producto</Text>
              <Text style={[s.statSub, { marginTop: 2 }]}>{productoActual.activo ? 'Visible y disponible para venta' : 'Oculto / fuera de operación'}</Text>
            </View>
            <TouchableOpacity
              style={[s.switchTrack, productoActual.activo ? s.switchOn : s.switchOff]}
              onPress={toggleActivo}
              activeOpacity={0.8}
            >
              <View style={[s.switchThumb, productoActual.activo ? s.switchThumbOn : s.switchThumbOff]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Historial */}
        <View style={s.infoBlock}>
          <Text style={s.blockTitle}>Historial de movimientos</Text>
          {(HISTORIALES[productoActual.id] || []).map((h, i) => (
            <View key={i} style={s.histRow}>
              <View style={[s.histDot, h.pos ? s.histDotIn : s.histDotAdj]} />
              <View style={s.histInfo}>
                <Text style={s.histTipo}>{h.tipo}</Text>
                <Text style={s.histFecha}>{h.fecha}</Text>
              </View>
              <Text style={h.pos ? s.histPos : s.histNeg}>
                {formatQtyHistorial(h.qty, productoActual.unidad || 'uds')}
              </Text>
            </View>
          ))}
        </View>

        {/* Botones de acción */}
        <TouchableOpacity style={s.editBtn} onPress={abrirEditar} activeOpacity={0.75}>
          <Text style={s.editBtnText}>✎  Editar datos del producto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.editBtn, s.editBtnTransfer]} onPress={() => setModalTransferir(true)} activeOpacity={0.75}>
          <Text style={[s.editBtnText, s.editBtnTransferText]}>⇄  Transferir a otro local</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>

      {/* Header */}
      <View style={s.topbar}>
        <View style={s.topbarRow}>
          <View>
            <Text style={s.topbarTitle}>Gestión de productos</Text>
            <Text style={s.topbarSub}>{productosFiltrados.length} productos</Text>
          </View>
        </View>
      </View>

      {/* Buscador */}
      <View style={s.searchWrap}>
        <View style={s.searchRow}>
          <TextInput
            style={s.searchInput}
            placeholder="Buscar por nombre o código..."
            placeholderTextColor={colors.placeholder}
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity style={s.searchClearBtn} onPress={() => setBusqueda('')} activeOpacity={0.7}>
              <Text style={s.searchClearIcon}>✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.searchScanBtn} onPress={() => setBusqueda('7891234560012')} activeOpacity={0.75}>
            <Text style={s.searchScanIcon}>[]</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtros */}
      <View style={s.filterWrap}>
        <TouchableOpacity
          style={[s.filterDropdown, filtroCategoria && s.filterDropdownActive]}
          onPress={() => setPickerVisible('categoria')}
          activeOpacity={0.75}
        >
          <Text style={[s.filterDropdownText, filtroCategoria && s.filterDropdownTextActive]} numberOfLines={1}>
            {filtroCategoria ?? 'Categoría'}
          </Text>
          <Text style={[s.filterDropdownArrow, filtroCategoria && s.filterDropdownTextActive]}>▾</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.filterDropdown, filtroProveedor && s.filterDropdownActive]}
          onPress={() => setPickerVisible('proveedor')}
          activeOpacity={0.75}
        >
          <Text style={[s.filterDropdownText, filtroProveedor && s.filterDropdownTextActive]} numberOfLines={1}>
            {filtroProveedor ?? 'Proveedor'}
          </Text>
          <Text style={[s.filterDropdownArrow, filtroProveedor && s.filterDropdownTextActive]}>▾</Text>
        </TouchableOpacity>

        {(filtroCategoria || filtroProveedor) && (
          <TouchableOpacity
            style={s.filterClear}
            onPress={() => { setFiltroCategoria(null); setFiltroProveedor(null); }}
            activeOpacity={0.75}
          >
            <Text style={s.filterClearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Picker modal */}
      <Modal visible={!!pickerVisible} animationType={isDesktop ? 'fade' : 'slide'} transparent onRequestClose={() => setPickerVisible(false)}>
        <Pressable style={overlayStyle} onPress={() => setPickerVisible(false)}>
          <Pressable style={sheetStyle} onPress={() => {}}>
            {!isDesktop && <View style={s.handle} />}
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>
                {pickerVisible === 'categoria' ? 'Filtrar por categoría' : 'Filtrar por proveedor'}
              </Text>
              <Pressable onPress={() => setPickerVisible(false)}>
                <Text style={s.closeBtn}>✕</Text>
              </Pressable>
            </View>
            <ScrollView>
              {/* Opción "Todos" */}
              <TouchableOpacity
                style={s.pickerOption}
                onPress={() => {
                  pickerVisible === 'categoria' ? setFiltroCategoria(null) : setFiltroProveedor(null);
                  setPickerVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={s.pickerOptionText}>Todos</Text>
                {!(pickerVisible === 'categoria' ? filtroCategoria : filtroProveedor) && (
                  <Text style={s.pickerCheck}>✓</Text>
                )}
              </TouchableOpacity>
              {(pickerVisible === 'categoria' ? CATEGORIAS : proveedores).map((opcion) => {
                const activo = pickerVisible === 'categoria'
                  ? filtroCategoria === opcion
                  : filtroProveedor === opcion;
                return (
                  <TouchableOpacity
                    key={opcion}
                    style={[s.pickerOption, activo && s.pickerOptionActive]}
                    onPress={() => {
                      pickerVisible === 'categoria'
                        ? setFiltroCategoria(opcion)
                        : setFiltroProveedor(opcion);
                      setPickerVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.pickerOptionText, activo && s.pickerOptionTextActive]}>{opcion}</Text>
                    {activo && <Text style={s.pickerCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: 20 }} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Layout desktop: master-detail en fila ────────────────────────────── */}
      {isDesktop ? (
        <View style={s.masterDetail}>

          {/* Panel izquierdo: lista */}
          <View style={s.masterPanel}>
            <FlatList
              data={productosFiltrados}
              keyExtractor={(item) => item.id}
              renderItem={renderProducto}
              contentContainerStyle={s.listContent}
              showsVerticalScrollIndicator={false}
            />
            <View style={[s.fabRow, s.fabRowDesktop]}>
              <TouchableOpacity style={[s.fab, s.fabUpdate]} onPress={() => setModalActualizar(true)} activeOpacity={0.85}>
                <Text style={s.fabUpdateText}>↑  Actualizar stock</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.fab, s.fabRegister]} onPress={() => setModalRegistrar(true)} activeOpacity={0.85}>
                <Text style={s.fabRegisterText}>+  Registrar producto</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Panel derecho: detalle */}
          <View style={s.detailPanel}>
            {productoActual ? (
              <>
                <View style={s.sheetHeader}>
                  <Text style={s.sheetTitle} numberOfLines={1}>{productoActual.nombre}</Text>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <DetalleContenido />
                </ScrollView>
              </>
            ) : (
              <View style={s.detailEmpty}>
                <Text style={s.detailEmptyText}>Selecciona un producto para ver su detalle</Text>
              </View>
            )}
          </View>

        </View>
      ) : (
        /* ── Layout móvil: lista + FABs ──────────────────────────────────────── */
        <View style={{ flex: 1 }}>
          <FlatList
            data={productosFiltrados}
            keyExtractor={(item) => item.id}
            renderItem={renderProducto}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
          />
          <View style={s.fabRow}>
            <TouchableOpacity style={[s.fab, s.fabUpdate]} onPress={() => setModalActualizar(true)} activeOpacity={0.85}>
              <Text style={s.fabUpdateText}>↑  Actualizar stock</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.fab, s.fabRegister]} onPress={() => setModalRegistrar(true)} activeOpacity={0.85}>
              <Text style={s.fabRegisterText}>+  Registrar producto</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Modal: Detalle (solo móvil) ───────────────────────────────────────── */}
      {!isDesktop && (
      <Modal visible={modalDetalle} animationType="slide" transparent onRequestClose={() => setModalDetalle(false)}>
        <Pressable style={s.overlay} onPress={() => setModalDetalle(false)}>
          <Pressable style={s.bottomSheet} onPress={() => {}}>
            <View style={s.handle} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle} numberOfLines={1}>{productoActual?.nombre}</Text>
              <TouchableOpacity onPress={() => setModalDetalle(false)}><Text style={s.closeBtn}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <DetalleContenido />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
      )}

      {/* ── Modal: Editar ──────────────────────────────────────────────────── */}
      <Modal visible={modalEditar} animationType={isDesktop ? 'fade' : 'slide'} transparent onRequestClose={() => setModalEditar(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={overlayStyle} onPress={() => setModalEditar(false)}>
            <Pressable style={sheetStyle} onPress={() => {}}>
              {!isDesktop && <View style={s.handle} />}
              <View style={s.sheetHeader}>
                <Text style={s.sheetTitle}>Editar producto</Text>
                <TouchableOpacity onPress={() => setModalEditar(false)}><Text style={s.closeBtn}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={s.formWrap}>
                  <FormField label="Nombre" value={editNombre} onChangeText={setEditNombre} placeholder="Nombre del producto" colors={colors} s={s} />
                  <FormField label={productoActual?.unidad === 'g' ? 'Precio por kg ($)' : 'Precio unitario ($)'} value={editPrecio} onChangeText={setEditPrecio} placeholder="Ej: 1290" keyboardType="numeric" colors={colors} s={s} />
                  <FormField label="Stock mínimo" value={editMinimo} onChangeText={setEditMinimo} placeholder="Ej: 20" keyboardType="numeric" colors={colors} s={s} />
                  <FormField label="Proveedor" value={editProveedor} onChangeText={setEditProveedor} placeholder="Nombre del proveedor" colors={colors} s={s} />
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
      <Modal visible={modalActualizar} animationType={isDesktop ? 'fade' : 'slide'} transparent onRequestClose={() => setModalActualizar(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={overlayStyle} onPress={() => setModalActualizar(false)}>
            <Pressable style={sheetStyle} onPress={() => {}}>
              {!isDesktop && <View style={s.handle} />}
              <View style={s.sheetHeader}>
                <Text style={s.sheetTitle}>Actualizar stock</Text>
                <TouchableOpacity onPress={() => setModalActualizar(false)}><Text style={s.closeBtn}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={s.formWrap}>
                  {/* Botón escanear */}
                  <TouchableOpacity style={s.scanBox} onPress={() => simularEscaneo('actualizar')} activeOpacity={0.75}>
                    <Text style={s.scanIcon}>[]</Text>
                    <Text style={s.scanTitle}>Escanear código de barras</Text>
                    <Text style={s.scanSub}>Usa la pistola</Text>
                  </TouchableOpacity>

                  <Text style={s.orDivider}>— o ingresa manualmente —</Text>

                  <FormField label="Código de barras" value={updCodigo} onChangeText={setUpdCodigo} placeholder="Ej: 7891234560012" keyboardType="numeric" colors={colors} s={s} />

                  {/* Info del producto encontrado */}
                  {productoUpdCodigo && (
                    <View style={{ backgroundColor: colors.surface2, borderRadius: 10, padding: 10, borderWidth: 0.5, borderColor: colors.border }}>
                      <Text style={[s.formLabel, { marginBottom: 2 }]}>PRODUCTO ENCONTRADO</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>{productoUpdCodigo.nombre}</Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
                        {productoUpdCodigo.categoria} · Stock: {formatStock(productoUpdCodigo.stock, productoUpdCodigo.unidad || 'uds')}
                      </Text>
                    </View>
                  )}

                  <FormField
                    label={productoUpdCodigo?.unidad === 'g' ? 'Cantidad a ingresar (gramos)' : 'Cantidad a ingresar (unidades)'}
                    value={updCantidad}
                    onChangeText={setUpdCantidad}
                    placeholder={productoUpdCodigo?.unidad === 'g' ? 'Ej: 5000' : 'Ej: 50'}
                    keyboardType="numeric"
                    colors={colors}
                    s={s}
                  />
                  <FormField label="Número de lote *" value={updLote} onChangeText={setUpdLote} placeholder="Ej: LOTE-001" colors={colors} s={s} />
                  {updRequiereFechaVenc && (
                    <FormField label="Fecha de vencimiento *" value={updFechaVenc} onChangeText={setUpdFechaVenc} placeholder="DD/MM/AAAA" colors={colors} s={s} />
                  )}

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
      <Modal visible={modalRegistrar} animationType={isDesktop ? 'fade' : 'slide'} transparent onRequestClose={() => setModalRegistrar(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={overlayStyle} onPress={() => setModalRegistrar(false)}>
            <Pressable style={sheetStyle} onPress={() => {}}>
              {!isDesktop && <View style={s.handle} />}
              <View style={s.sheetHeader}>
                <Text style={s.sheetTitle}>Registrar producto</Text>
                <TouchableOpacity onPress={() => setModalRegistrar(false)}><Text style={s.closeBtn}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={s.formWrap}>
                  {/* Botón escanear */}
                  <TouchableOpacity style={s.scanBox} onPress={() => simularEscaneo('registrar')} activeOpacity={0.75}>
                    <Text style={s.scanIcon}>[]</Text>
                    <Text style={s.scanTitle}>Escanear código de barras</Text>
                    <Text style={s.scanSub}>Usa la pistola</Text>
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

                  <View style={s.formGroup}>
                    <Text style={s.formLabel}>TIPO DE STOCK</Text>
                    <View style={s.selectWrap}>
                      {[{ label: 'Por unidades', val: 'uds' }, { label: 'Por peso (gramos)', val: 'g' }].map((op) => (
                        <TouchableOpacity
                          key={op.val}
                          style={[s.selectOption, regUnidad === op.val && s.selectOptionActive]}
                          onPress={() => setRegUnidad(op.val)}
                        >
                          <Text style={[s.selectOptionText, regUnidad === op.val && s.selectOptionTextActive]}>
                            {op.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <FormField label="Número de lote *" value={regLote} onChangeText={setRegLote} placeholder="Ej: LOTE-001" colors={colors} s={s} />
                  {requiereFechaVenc(regCategoria) && (
                    <FormField label="Fecha de vencimiento *" value={regFechaVenc} onChangeText={setRegFechaVenc} placeholder="DD/MM/AAAA" colors={colors} s={s} />
                  )}
                  <FormField label={regUnidad === 'g' ? 'Precio por kg ($)' : 'Precio unitario ($)'} value={regPrecio} onChangeText={setRegPrecio} placeholder="Ej: 1290" keyboardType="numeric" colors={colors} s={s} />
                  <FormField label={regUnidad === 'g' ? 'Stock inicial (gramos)' : 'Stock inicial (unidades)'} value={regStock} onChangeText={setRegStock} placeholder={regUnidad === 'g' ? 'Ej: 5000' : 'Ej: 100'} keyboardType="numeric" colors={colors} s={s} />
                  <FormField label={regUnidad === 'g' ? 'Stock mínimo (gramos)' : 'Stock mínimo (unidades)'} value={regMinimo} onChangeText={setRegMinimo} placeholder={regUnidad === 'g' ? 'Ej: 1000' : 'Ej: 20'} keyboardType="numeric" colors={colors} s={s} />

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

      {/* ── Modal: Transferir a otro local ──────────────────────────────────── */}
      <Modal visible={modalTransferir} animationType={isDesktop ? 'fade' : 'slide'} transparent onRequestClose={() => setModalTransferir(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={overlayStyle} onPress={() => setModalTransferir(false)}>
            <Pressable style={sheetStyle} onPress={() => {}}>
              {!isDesktop && <View style={s.handle} />}
              <View style={s.sheetHeader}>
                <Text style={s.sheetTitle}>⇄  Transferir a otro local</Text>
                <TouchableOpacity onPress={() => setModalTransferir(false)}><Text style={s.closeBtn}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={s.formWrap}>
                  {productoActual && (
                    <View style={{ backgroundColor: colors.surface2, borderRadius: 10, padding: 12, borderWidth: 0.5, borderColor: colors.border }}>
                      <Text style={[s.formLabel, { marginBottom: 4 }]}>PRODUCTO</Text>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>{productoActual.nombre}</Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                        Stock disponible: {formatStock(productoActual.stock, productoActual.unidad || 'uds')}
                      </Text>
                    </View>
                  )}
                  <FormField label="Local de destino *" value={transLocal} onChangeText={setTransLocal} placeholder="Ej: Sucursal Centro" colors={colors} s={s} />
                  <FormField
                    label={`Cantidad a transferir (${productoActual?.unidad === 'g' ? 'gramos' : 'unidades'}) *`}
                    value={transCantidad}
                    onChangeText={setTransCantidad}
                    placeholder={productoActual?.unidad === 'g' ? 'Ej: 2000' : 'Ej: 10'}
                    keyboardType="numeric"
                    colors={colors}
                    s={s}
                  />
                  <TouchableOpacity style={[s.btnPrimary, { backgroundColor: '#1A6FA8' }]} onPress={confirmarTransferencia} activeOpacity={0.85}>
                    <Text style={s.btnPrimaryText}>Confirmar transferencia</Text>
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
    topbarRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    topbarTitle:      { fontSize: 16, fontWeight: '600', color: c.textPrimary },
    topbarSub:        { fontSize: 12, color: c.textSecondary, marginTop: 1 },
    themeToggle:      { width: 36, height: 36, borderRadius: 10, backgroundColor: c.surface2, borderWidth: 0.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
    themeToggleIcon:  { fontSize: 18 },

    // Filtros (dropdowns compactos)
    filterWrap:           { backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', gap: 8, alignItems: 'center' },
    filterDropdown:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.surface2, borderWidth: 0.5, borderColor: c.border, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 8, gap: 4 },
    filterDropdownActive: { backgroundColor: c.btnBg, borderColor: c.btnBg },
    filterDropdownText:   { flex: 1, fontSize: 13, color: c.textSecondary },
    filterDropdownTextActive: { color: c.btnText, fontWeight: '500' },
    filterDropdownArrow:  { fontSize: 11, color: c.textSecondary },

    // Picker de filtros
    pickerOption:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 0.5, borderBottomColor: c.border },
    pickerOptionActive:   { backgroundColor: c.surface2 },
    pickerOptionText:     { fontSize: 14, color: c.textPrimary },
    pickerOptionTextActive: { fontWeight: '600', color: c.accentText },
    pickerCheck:          { fontSize: 15, color: c.accentText, fontWeight: '600' },

    // Buscador
    // Buscador
    searchWrap:       { backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border, paddingHorizontal: 12, paddingVertical: 10 },
    searchRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
    searchInput:      { flex: 1, backgroundColor: c.surface2, borderWidth: 0.5, borderColor: c.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: c.textPrimary },
    searchClearBtn:   { width: 34, height: 34, borderRadius: 9, backgroundColor: c.surface2, borderWidth: 0.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
    searchClearIcon:  { fontSize: 13, color: c.textSecondary, fontWeight: '600' },
    searchScanBtn:    { width: 34, height: 34, borderRadius: 9, backgroundColor: c.btnBg, alignItems: 'center', justifyContent: 'center' },
    searchScanIcon:   { fontSize: 17, color: c.btnText },

    // Lista
    listContent:      { padding: 12, paddingBottom: 90, gap: 8 },

    // Tarjeta producto
    card:             { backgroundColor: c.surface, borderWidth: 0.5, borderColor: c.border, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardInactivo:     { opacity: 0.55 },
    cardIcon:         { width: 38, height: 38, borderRadius: 10, backgroundColor: '#E6F1FB', alignItems: 'center', justifyContent: 'center' },
    cardIconText:     { fontSize: 16 },
    cardInfo:         { flex: 1 },
    cardNombre:       { fontSize: 14, fontWeight: '500', color: c.textPrimary },
    cardCodigo:       { fontSize: 11, color: c.textSecondary, marginTop: 1 },
    cardRight:        { alignItems: 'flex-end' },
    stockNum:         { fontSize: 15, fontWeight: '600', color: c.textPrimary },
    stockLbl:         { fontSize: 11, color: c.textSecondary },

    badge:            { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },

    // Switch
    switchOn:         { backgroundColor: '#4CAF50' },
    switchOff:        { backgroundColor: '#CCC' },
    switchTrack:      { width: 48, height: 28, borderRadius: 14, justifyContent: 'center', paddingHorizontal: 2 },
    switchThumb:      { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
    switchThumbOn:    { alignSelf: 'flex-end' },
    switchThumbOff:   { alignSelf: 'flex-start' },

    // FABs
    fabRow:           { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 10, padding: 12, backgroundColor: c.surface, borderTopWidth: 0.5, borderTopColor: c.border },
    fab:              { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    fabUpdate:        { backgroundColor: c.btnBg },
    fabRegister:      { backgroundColor: '#E6F1FB', borderWidth: 0.5, borderColor: '#B5D4F4' },
    fabUpdateText:    { fontSize: 13, fontWeight: '600', color: c.btnText },
    fabRegisterText:  { fontSize: 13, fontWeight: '600', color: '#0C447C' },

    // Desktop layout master-detail
    masterDetail:     { flex: 1, flexDirection: 'row' },
    masterPanel:      { flex: 1, borderRightWidth: 0.5, borderRightColor: c.border },
    detailPanel:      { flex: 1, backgroundColor: c.surface2 },
    detailEmpty:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
    detailEmptyIcon:  { fontSize: 40 },
    detailEmptyText:  { fontSize: 14, color: c.textSecondary, textAlign: 'center' },

    // (kept for fabRowDesktop)
    desktopWrapper:   { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center' },
    fabRowDesktop:    { position: 'relative', borderTopWidth: 0.5, borderTopColor: c.border },

    // Modal / Bottom Sheet (móvil)
    overlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    bottomSheet:      { backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },

    // Modal desktop (dialog centrado)
    overlayDesktop:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    bottomSheetDesktop:   { backgroundColor: c.surface, borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 12 },
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

    histInfo:         { flex: 1 },
    histTipo:         { fontSize: 13, color: c.textPrimary },
    histFecha:        { fontSize: 11, color: c.textSecondary },

    // Botón editar
    editBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginHorizontal: 12, marginTop: 4, borderWidth: 0.5, borderColor: c.border, borderRadius: 10, paddingVertical: 10 },
    editBtnText:      { fontSize: 13, color: c.textPrimary },
    editBtnTransfer:  { borderColor: '#B5D4F4', backgroundColor: '#E6F1FB' },
    editBtnTransferText: { color: '#0C447C', fontWeight: '500' },

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