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

// ─── DATOS ────────────────────────────────────────────

const INGREDIENTES_DB = [
  { nombre: 'Papa', medidas: ['100gr', '250gr', '500gr', '1kg'] },
  { nombre: 'Pollo', medidas: ['200gr', '500gr', '1kg'] },
  { nombre: 'Carne Hamburguesa', medidas: ['100gr', '150gr', '200gr'] },
  { nombre: 'Salchicha', medidas: ['1un', '2un', '6un', '12un'] },
  { nombre: 'Huevo', medidas: ['1un', '2un', '3un', '6un'] },
  { nombre: 'Pan Hamburguesa', medidas: ['1un', '2un', '6un', '12un'] },
  { nombre: 'Queso', medidas: ['1lamina', '2laminas', '100gr', '250gr'] },
  { nombre: 'Jamón', medidas: ['50gr', '100gr', '200gr'] },
  { nombre: 'Tomate', medidas: ['100gr', '200gr', '300gr', '500gr'] },
  { nombre: 'Cebolla', medidas: ['50gr', '100gr', '200gr', '500gr'] },
  { nombre: 'Lechuga', medidas: ['50gr', '100gr', '1un'] },
  { nombre: 'Palta', medidas: ['100gr', '250gr', '500gr', '1kg'] },
  { nombre: 'Arroz', medidas: ['100gr', '300gr', '500gr', '1kg'] },
  { nombre: 'Aceite', medidas: ['10ml', '50ml', '100ml', '500ml'] },
  { nombre: 'Mayonesa', medidas: ['10ml', '30ml', '50ml', '100ml'] },
  { nombre: 'Ketchup', medidas: ['10ml', '30ml', '50ml', '100ml'] },
  { nombre: 'Mostaza', medidas: ['10ml', '30ml', '50ml'] },
  { nombre: 'Sal', medidas: ['5gr', '10gr', '20gr'] },
  { nombre: 'Bebida', medidas: ['350ml', '500ml', '1.5L'] },
  { nombre: 'Leche', medidas: ['250ml', '500ml', '1L'] },
  { nombre: 'Cafe', medidas: ['30gr', '50gr', '100gr'] },
  { nombre: 'Harina', medidas: ['100gr', '200gr', '500gr', '1kg'] },
  { nombre: 'Mantequilla', medidas: ['50gr', '100gr', '250gr'] },
  { nombre: 'Agua', medidas: ['250ml', '500ml', '1L'] },
];

const EQUIVALENCIAS = {
  Papa: 150,
  Tomate: 180,
  Cebolla: 120,
  Palta: 250,
  Lechuga: 300,
  Huevo: 1,
  'Pan Hamburguesa': 1,
  Salchicha: 1,
};

const CATEGORIAS_RECETAS = [
  {
    nombre: 'Papas y frituras',
    items: ['Papas fritas', 'Papas con pollo', 'Salchipapas', 'Nuggets con papas'],
  },
  {
    nombre: 'Pollo',
    items: ['Pollo frito', 'Pollo al plato', 'Pollo con papas', 'Pollo con arroz'],
  },
  {
    nombre: 'Sandwiches',
    items: ['Sandwich de pollo', 'Sandwich de carne', 'Sandwich mixto'],
  },
  {
    nombre: 'Platos preparados',
    items: ['Pollo con arroz', 'Pollo con ensalada', 'Menu del dia'],
  },
  {
    nombre: 'Panaderia',
    items: ['Pan', 'Croissant', 'Tostadas', 'Sandwiches simples'],
  },
  {
    nombre: 'Pasteleria',
    items: ['Tortas', 'Kuchen', 'Muffins', 'Galletas'],
  },
  {
    nombre: 'Bebidas calientes',
    items: ['Cafe espresso', 'Cafe latte', 'Cappuccino', 'Te', 'Chocolate caliente'],
  },
  {
    nombre: 'Bebidas frias',
    items: ['Jugos', 'Batidos', 'Cafe frio'],
  },
  
];

const RECETAS_INICIALES = [
  {
    id: '1',
    nombre: 'Papas fritas',
    categoria: 'Papas y frituras',
    precio: 2500,
    activa: true,
    ingredientes: [
      { nombre: 'Papa', medida: '500gr' },
      { nombre: 'Aceite', medida: '50ml' },
      { nombre: 'Sal', medida: '5gr' },
    ],
  },

  {
    id: '2',
    nombre: 'Cappuccino',
    categoria: 'Bebidas calientes',
    precio: 3200,
    activa: true,
    ingredientes: [
      { nombre: 'Leche', medida: '250ml' },
      { nombre: 'Cafe', medida: '30gr' },
    ],
  },

  {
    id: '3',
    nombre: 'Croissant',
    categoria: 'Panaderia',
    precio: 1800,
    activa: true,
    ingredientes: [
      { nombre: 'Harina', medida: '200gr' },
      { nombre: 'Mantequilla', medida: '50gr' },
    ],
  },

  // ─── PAPAS Y FRITURAS ─────────────────────────

  {
    id: '4',
    nombre: 'Salchipapas',
    categoria: 'Papas y frituras',
    precio: 4500,
    activa: true,
    ingredientes: [
      { nombre: 'Papa', medida: '500gr' },
      { nombre: 'Salchicha', medida: '2un' },
      { nombre: 'Ketchup', medida: '30ml' },
      { nombre: 'Mayonesa', medida: '30ml' },
    ],
  },

  {
    id: '5',
    nombre: 'Nuggets con papas',
    categoria: 'Papas y frituras',
    precio: 5200,
    activa: true,
    ingredientes: [
      { nombre: 'Papa', medida: '500gr' },
      { nombre: 'Pollo', medida: '200gr' },
      { nombre: 'Aceite', medida: '50ml' },
    ],
  },

  // ─── POLLO ────────────────────────────────────

  {
    id: '6',
    nombre: 'Pollo frito',
    categoria: 'Pollo',
    precio: 6500,
    activa: true,
    ingredientes: [
      { nombre: 'Pollo', medida: '500gr' },
      { nombre: 'Aceite', medida: '100ml' },
      { nombre: 'Sal', medida: '10gr' },
    ],
  },

  {
    id: '7',
    nombre: 'Pollo con arroz',
    categoria: 'Pollo',
    precio: 5900,
    activa: true,
    ingredientes: [
      { nombre: 'Pollo', medida: '500gr' },
      { nombre: 'Arroz', medida: '300gr' },
      { nombre: 'Sal', medida: '5gr' },
    ],
  },

  {
    id: '8',
    nombre: 'Pollo con papas',
    categoria: 'Pollo',
    precio: 6100,
    activa: true,
    ingredientes: [
      { nombre: 'Pollo', medida: '500gr' },
      { nombre: 'Papa', medida: '500gr' },
    ],
  },

  // ─── SANDWICHES ───────────────────────────────

  {
    id: '9',
    nombre: 'Sandwich de pollo',
    categoria: 'Sandwiches',
    precio: 4200,
    activa: true,
    ingredientes: [
      { nombre: 'Pollo', medida: '200gr' },
      { nombre: 'Tomate', medida: '100gr' },
      { nombre: 'Lechuga', medida: '50gr' },
      { nombre: 'Mayonesa', medida: '30ml' },
    ],
  },

  {
    id: '10',
    nombre: 'Sandwich mixto',
    categoria: 'Sandwiches',
    precio: 3800,
    activa: true,
    ingredientes: [
      { nombre: 'Jamón', medida: '100gr' },
      { nombre: 'Queso', medida: '2laminas' },
      { nombre: 'Tomate', medida: '100gr' },
    ],
  },

  {
    id: '11',
    nombre: 'Hamburguesa clasica',
    categoria: 'Sandwiches',
    precio: 5600,
    activa: true,
    ingredientes: [
      { nombre: 'Pan Hamburguesa', medida: '1un' },
      { nombre: 'Carne Hamburguesa', medida: '150gr' },
      { nombre: 'Queso', medida: '1lamina' },
      { nombre: 'Tomate', medida: '100gr' },
    ],
  },

  // ─── PLATOS PREPARADOS ────────────────────────

  {
    id: '12',
    nombre: 'Pollo con ensalada',
    categoria: 'Platos preparados',
    precio: 6200,
    activa: true,
    ingredientes: [
      { nombre: 'Pollo', medida: '500gr' },
      { nombre: 'Tomate', medida: '200gr' },
      { nombre: 'Lechuga', medida: '100gr' },
      { nombre: 'Palta', medida: '100gr' },
    ],
  },

  {
    id: '13',
    nombre: 'Menu del dia',
    categoria: 'Platos preparados',
    precio: 7000,
    activa: true,
    ingredientes: [
      { nombre: 'Pollo', medida: '500gr' },
      { nombre: 'Arroz', medida: '300gr' },
      { nombre: 'Tomate', medida: '100gr' },
    ],
  },

  // ─── PANADERIA ────────────────────────────────

  {
    id: '14',
    nombre: 'Tostadas',
    categoria: 'Panaderia',
    precio: 1500,
    activa: true,
    ingredientes: [
      { nombre: 'Pan Hamburguesa', medida: '2un' },
      { nombre: 'Mantequilla', medida: '50gr' },
    ],
  },

  {
    id: '15',
    nombre: 'Pan amasado',
    categoria: 'Panaderia',
    precio: 1200,
    activa: true,
    ingredientes: [
      { nombre: 'Harina', medida: '200gr' },
      { nombre: 'Aceite', medida: '10ml' },
    ],
  },

  // ─── PASTELERIA ───────────────────────────────

  {
    id: '16',
    nombre: 'Muffins',
    categoria: 'Pasteleria',
    precio: 2200,
    activa: true,
    ingredientes: [
      { nombre: 'Harina', medida: '200gr' },
      { nombre: 'Huevo', medida: '2un' },
    ],
  },

  {
    id: '17',
    nombre: 'Galletas',
    categoria: 'Pasteleria',
    precio: 1800,
    activa: true,
    ingredientes: [
      { nombre: 'Harina', medida: '200gr' },
      { nombre: 'Huevo', medida: '1un' },
    ],
  },

  {
    id: '18',
    nombre: 'Kuchen de manzana',
    categoria: 'Pasteleria',
    precio: 3500,
    activa: true,
    ingredientes: [
      { nombre: 'Harina', medida: '300gr' },
      { nombre: 'Huevo', medida: '3un' },
    ],
  },

  // ─── BEBIDAS CALIENTES ────────────────────────

  {
    id: '19',
    nombre: 'Cafe espresso',
    categoria: 'Bebidas calientes',
    precio: 2500,
    activa: true,
    ingredientes: [
      { nombre: 'Cafe', medida: '30gr' },
    ],
  },

  {
    id: '20',
    nombre: 'Chocolate caliente',
    categoria: 'Bebidas calientes',
    precio: 3400,
    activa: true,
    ingredientes: [
      { nombre: 'Leche', medida: '250ml' },
    ],
  },

  {
    id: '21',
    nombre: 'Te',
    categoria: 'Bebidas calientes',
    precio: 1800,
    activa: true,
    ingredientes: [
      { nombre: 'Agua', medida: '250ml' },
    ],
  },

  // ─── BEBIDAS FRIAS ────────────────────────────

  {
    id: '22',
    nombre: 'Jugo natural',
    categoria: 'Bebidas frias',
    precio: 2800,
    activa: true,
    ingredientes: [
      { nombre: 'Bebida', medida: '500ml' },
    ],
  },

  {
    id: '23',
    nombre: 'Batido de frutas',
    categoria: 'Bebidas frias',
    precio: 3900,
    activa: true,
    ingredientes: [
      { nombre: 'Leche', medida: '250ml' },
      { nombre: 'Palta', medida: '100gr' },
    ],
  },

  {
    id: '24',
    nombre: 'Cafe frio',
    categoria: 'Bebidas frias',
    precio: 3500,
    activa: true,
    ingredientes: [
      { nombre: 'Cafe', medida: '30gr' },
      { nombre: 'Leche', medida: '250ml' },
    ],
  },
];

// ─── PICKER DROPDOWN ──────────────────────────────────

function DropdownPicker({ label, valor, opciones, onSeleccionar, placeholder, colors, s }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ marginBottom: 6 }}>
      {label ? <Text style={s.ingSubLabel}>{label}</Text> : null}
      <TouchableOpacity
        style={s.dropdownBtn}
        onPress={() => setVisible(true)}
        activeOpacity={0.75}
      >
        <Text
          style={valor ? s.dropdownBtnText : s.dropdownBtnPlaceholder}
          numberOfLines={1}
        >
          {valor || placeholder}
        </Text>
        <Text style={s.dropdownArrow}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={s.pickerOverlay} onPress={() => setVisible(false)}>
          <View style={s.pickerBox}>
            <View style={s.pickerHeader}>
              <Text style={s.pickerTitle}>{label || placeholder}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={s.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {opciones.map((op) => (
                <TouchableOpacity
                  key={op}
                  style={[s.pickerOption, valor === op && s.pickerOptionActive]}
                  onPress={() => { onSeleccionar(op); setVisible(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[s.pickerOptionText, valor === op && s.pickerOptionTextActive]}>
                    {op}
                  </Text>
                  {valor === op && <Text style={s.pickerCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── HELPERS ──────────────────────────────────────────

function calcularUnidadesAprox(nombre, medida) {
  const equivalencia = EQUIVALENCIAS[nombre];
  if (!equivalencia) return null;
  const match = medida.match(/(\d+)(gr|ml|kg)/);
  if (!match) return null;
  let cantidad = parseInt(match[1]);
  let tipo = match[2];
  if (tipo === 'kg') cantidad *= 1000;
  if (tipo === 'ml') return null;
  const unidades = Math.round(cantidad / equivalencia);
  if (unidades <= 0) return null;
  return `aprox. ${unidades} ${unidades === 1 ? 'unidad' : 'unidades'}`;
}

// ─── FILA INGREDIENTE ─────────────────────────────────

function IngredienteRow({ ing, index, onActualizar, onEliminar, colors, s }) {
  const medidas = INGREDIENTES_DB.find(i => i.nombre === ing.nombre)?.medidas || [];
  return (
    <View style={s.ingCard}>
      <DropdownPicker
        label="Ingrediente"
        valor={ing.nombre}
        opciones={INGREDIENTES_DB.map(i => i.nombre)}
        onSeleccionar={(val) => onActualizar(index, 'nombre', val)}
        placeholder="Seleccionar ingrediente..."
        colors={colors}
        s={s}
      />
      {ing.nombre !== '' && (
        <DropdownPicker
          label="Medida"
          valor={ing.medida}
          opciones={medidas}
          onSeleccionar={(val) => onActualizar(index, 'medida', val)}
          placeholder="Seleccionar medida..."
          colors={colors}
          s={s}
        />
      )}
      <TouchableOpacity onPress={() => onEliminar(index)} activeOpacity={0.7}>
        <Text style={s.ingEliminar}>Eliminar ingrediente</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── FORMULARIO ───────────────────────────────────────

function FormReceta({
  visible,
  titulo,
  isDesktop,
  nombre, setNombre,
  categoria, setCategoria,
  precio, setPrecio,
  ingredientes, setIngredientes,
  onGuardar,
  onCerrar,
  colors,
  s,
}) {
  const overlayStyle = isDesktop ? s.overlayDesktop : s.overlay;
  const sheetStyle   = isDesktop ? s.bottomSheetDesktop : s.bottomSheet;

  function agregarIngrediente() {
    setIngredientes(prev => [...prev, { nombre: '', medida: '' }]);
  }

  function actualizarIngrediente(i, campo, valor) {
    setIngredientes(prev =>
      prev.map((ing, idx) =>
        idx === i
          ? { ...ing, [campo]: valor, ...(campo === 'nombre' ? { medida: '' } : {}) }
          : ing
      )
    );
  }

  function eliminarIngrediente(i) {
    setIngredientes(prev => prev.filter((_, idx) => idx !== i));
  }

  return (
    <Modal
      visible={visible}
      animationType={isDesktop ? 'fade' : 'slide'}
      transparent
      onRequestClose={onCerrar}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable style={overlayStyle} onPress={onCerrar}>
          <Pressable style={sheetStyle} onPress={() => {}}>
            {!isDesktop && <View style={s.handle} />}

            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>{titulo}</Text>
              <TouchableOpacity onPress={onCerrar}>
                <Text style={s.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={s.formWrap}>

                <View style={s.formGroup}>
                  <Text style={s.formLabel}>Nombre de la receta *</Text>
                  <TextInput
                    style={s.formInput}
                    placeholder="Ej: Papas fritas"
                    placeholderTextColor={colors.placeholder}
                    value={nombre}
                    onChangeText={setNombre}
                  />
                </View>

                <View style={s.formGroup}>
                  <Text style={s.formLabel}>Categoria</Text>
                  <DropdownPicker
                    label=""
                    valor={categoria}
                    opciones={CATEGORIAS_RECETAS.map(c => c.nombre)}
                    onSeleccionar={setCategoria}
                    placeholder="Seleccionar categoria..."
                    colors={colors}
                    s={s}
                  />
                </View>

                <View style={s.formGroup}>
                  <Text style={s.formLabel}>Precio de venta ($)</Text>
                  <TextInput
                    style={s.formInput}
                    placeholder="Ej: 2500"
                    placeholderTextColor={colors.placeholder}
                    value={precio}
                    onChangeText={setPrecio}
                    keyboardType="numeric"
                  />
                </View>

                <View style={s.formGroup}>
                  <Text style={s.formLabel}>Ingredientes</Text>

                  {ingredientes.map((ing, i) => (
                    <IngredienteRow
                      key={i}
                      ing={ing}
                      index={i}
                      onActualizar={actualizarIngrediente}
                      onEliminar={eliminarIngrediente}
                      colors={colors}
                      s={s}
                    />
                  ))}

                  <TouchableOpacity
                    style={s.addIngBtn}
                    onPress={agregarIngrediente}
                    activeOpacity={0.75}
                  >
                    <Text style={s.addIngText}>+ Agregar ingrediente</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={s.btnPrimary}
                  onPress={onGuardar}
                  activeOpacity={0.85}
                >
                  <Text style={s.btnPrimaryText}>Guardar receta</Text>
                </TouchableOpacity>

                <View style={{ height: 20 }} />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────

export default function ScreenGestionRecetas() {
  const { colors, isDark, toggle } = useTheme();
  const s = makeStyles(colors);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [recetas,         setRecetas]         = useState(RECETAS_INICIALES);
  const [recetaActual,    setRecetaActual]     = useState(null);
  const [busqueda,        setBusqueda]         = useState('');
  const [modalCrear,      setModalCrear]       = useState(false);
  const [modalEditar,     setModalEditar]      = useState(false);
  const [modalDetalle,    setModalDetalle]     = useState(false);
  const [categoriaFiltro, setCategoriaFiltro]  = useState(null);

  const [nombre,       setNombre]       = useState('');
  const [precio,       setPrecio]       = useState('');
  const [ingredientes, setIngredientes] = useState([]);
  const [categoria,    setCategoria]    = useState('');

  // ─── HELPERS ──────────────────────────

  function resetForm() {
    setNombre('');
    setCategoria('');
    setPrecio('');
    setIngredientes([]);
  }

  function abrirDetalle(r) {
    setRecetaActual(r);
    if (!isDesktop) setModalDetalle(true);
  }

  function abrirCrear() {
    resetForm();
    setModalCrear(true);
  }

  function abrirEditar() {
    setNombre(recetaActual.nombre);
    setCategoria(recetaActual.categoria);
    setPrecio(String(recetaActual.precio));
    setIngredientes(recetaActual.ingredientes.map(i => ({ ...i })));
    setModalEditar(true);
  }

  // ─── CRUD ─────────────────────────────

  function crearReceta() {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacio');
      return;
    }
    const nueva = {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      categoria,
      precio: parseInt(precio) || 0,
      ingredientes,
      activa: true,
    };
    setRecetas(prev => [nueva, ...prev]);
    resetForm();
    setModalCrear(false);
    Alert.alert('Listo', `"${nueva.nombre}" creada correctamente`);
  }

  function guardarEdicion() {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacio');
      return;
    }
    const actualizada = {
      ...recetaActual,
      nombre: nombre.trim(),
      categoria,
      precio: parseInt(precio) || recetaActual.precio,
      ingredientes,
    };
    setRecetas(prev => prev.map(r => (r.id === actualizada.id ? actualizada : r)));
    setRecetaActual(actualizada);
    setModalEditar(false);
    Alert.alert('Listo', 'Receta actualizada correctamente');
  }

  function toggleActiva(id) {
    setRecetas(prev => prev.map(r => r.id === id ? { ...r, activa: !r.activa } : r));
    setRecetaActual(prev => prev?.id === id ? { ...prev, activa: !prev.activa } : prev);
  }

  // ─── FILTRADO ─────────────────────────

  const recetasFiltradas = recetas.filter(r => {
    const coincideBusqueda  = r.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === null || r.categoria === categoriaFiltro;
    return coincideBusqueda && coincideCategoria;
  });

  const categoriasConRecetas = CATEGORIAS_RECETAS.filter(c =>
    recetas.some(r => r.categoria === c.nombre)
  );

  // ─── RENDER TARJETA ───────────────────

  function renderReceta({ item }) {
    const isSelected = isDesktop && recetaActual?.id === item.id;
    return (
      <TouchableOpacity
        style={[s.card, isSelected && s.cardSelected]}
        onPress={() => abrirDetalle(item)}
        activeOpacity={0.75}
      >
        <View style={s.cardIcon}>
          <Text style={s.cardIconText}></Text>
        </View>

        <View style={s.cardInfo}>
          <Text style={s.cardNombre} numberOfLines={1}>{item.nombre}</Text>
          <View style={s.categoriaBadge}>
            <Text style={s.categoriaBadgeText}>{item.categoria}</Text>
          </View>
          <Text style={s.cardSub}>{item.ingredientes.length} ingredientes</Text>
          <View style={[s.badge, item.activa ? s.badge_ok : s.badge_out]}>
            <Text style={[s.badgeText, item.activa ? s.badgeText_ok : s.badgeText_out]}>
              {item.activa ? 'Activa' : 'Desactivada'}
            </Text>
          </View>
        </View>

        <View style={s.cardRight}>
          <Text style={s.precioNum}>${item.precio.toLocaleString('es-CL')}</Text>
          <Text style={s.precioLbl}>CLP</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ─── DETALLE ──────────────────────────

  function DetalleContenido() {
    if (!recetaActual) return null;
    return (
      <>
        <View style={s.statsGrid}>
          {[
            { label: 'Precio de venta', value: '$' + recetaActual.precio.toLocaleString('es-CL'), sub: 'CLP' },
            { label: 'Ingredientes', value: String(recetaActual.ingredientes.length), sub: 'items' },
            { label: 'Estado', value: recetaActual.activa ? 'Activa' : 'Desactivada' },
          ].map((item, i) => (
            <View key={i} style={s.statCard}>
              <Text style={s.statLabel}>{item.label}</Text>
              <Text style={s.statValue} numberOfLines={2}>{item.value}</Text>
              {item.sub && <Text style={s.statSub}>{item.sub}</Text>}
            </View>
          ))}
        </View>

        <View style={s.infoBlock}>
          <Text style={s.blockTitle}>Ingredientes</Text>
          {recetaActual.ingredientes.length === 0 ? (
            <View style={s.infoRow}>
              <Text style={s.infoKey}>Sin ingredientes registrados</Text>
            </View>
          ) : (
            recetaActual.ingredientes.map((ing, idx) => {
              const aprox = calcularUnidadesAprox(ing.nombre, ing.medida);
              return (
                <View key={idx} style={s.infoRow}>
                  <Text style={s.infoKey}>{ing.nombre}</Text>
                  <Text style={s.infoVal}>
                    {ing.medida}{aprox ? ` (${aprox})` : ''}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        <TouchableOpacity style={s.editBtn} onPress={abrirEditar} activeOpacity={0.75}>
          <Text style={s.editBtnText}>Editar receta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.editBtn, { marginTop: 8, borderColor: recetaActual.activa ? '#F5C6C6' : '#B5D4F4' }]}
          onPress={() => toggleActiva(recetaActual.id)}
          activeOpacity={0.75}
        >
          <Text style={[s.editBtnText, { color: recetaActual.activa ? '#791F1F' : '#0C447C' }]}>
            {recetaActual.activa ? 'Desactivar receta' : 'Activar receta'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </>
    );
  }

  // ─── FILTROS DE CATEGORIA ─────────────────────────────

  function CategoriasFilter() {
    return (
      <View style={s.categoriasWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categoriasScroll}
        >
          <TouchableOpacity
            style={[s.categoriaChip, categoriaFiltro === null && s.categoriaChipActive]}
            onPress={() => setCategoriaFiltro(null)}
            activeOpacity={0.75}
          >
            <Text style={[s.categoriaChipText, categoriaFiltro === null && s.categoriaChipTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>

          {categoriasConRecetas.map((cat) => (
            <TouchableOpacity
              key={cat.nombre}
              style={[s.categoriaChip, categoriaFiltro === cat.nombre && s.categoriaChipActive]}
              onPress={() =>
                setCategoriaFiltro(prev => prev === cat.nombre ? null : cat.nombre)
              }
              activeOpacity={0.75}
            >
              <Text style={[s.categoriaChipText, categoriaFiltro === cat.nombre && s.categoriaChipTextActive]}>
                {cat.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ─── RENDER PRINCIPAL ─────────────────

  return (
    <View style={s.container}>

      {/* Header */}
      <View style={s.topbar}>
        <View style={s.topbarRow}>
          <View>
            <Text style={s.topbarTitle}>Gestion de recetas</Text>
            <Text style={s.topbarSub}>{recetasFiltradas.length} recetas</Text>
          </View>
        </View>
      </View>

      {/* Buscador */}
      <View style={s.searchWrap}>
        <View style={s.searchRow}>
          <TextInput
            style={s.searchInput}
            placeholder="Buscar receta..."
            placeholderTextColor={colors.placeholder}
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity style={s.searchClearBtn} onPress={() => setBusqueda('')} activeOpacity={0.7}>
              <Text style={s.searchClearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtros de categoria */}
      <CategoriasFilter />

      {/* Layout desktop / movil */}
      {isDesktop ? (
        <View style={s.masterDetail}>
          <View style={s.masterPanel}>
            <FlatList
              data={recetasFiltradas}
              keyExtractor={item => item.id}
              renderItem={renderReceta}
              contentContainerStyle={s.listContent}
              showsVerticalScrollIndicator={false}
            />
            <View style={[s.fabRow, s.fabRowDesktop]}>
              <TouchableOpacity style={[s.fab, s.fabRegister]} onPress={abrirCrear} activeOpacity={0.85}>
                <Text style={s.fabRegisterText}>+ Nueva receta</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.detailPanel}>
            {recetaActual ? (
              <>
                <View style={s.sheetHeader}>
                  <Text style={s.sheetTitle} numberOfLines={1}>{recetaActual.nombre}</Text>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <DetalleContenido />
                </ScrollView>
              </>
            ) : (
              <View style={s.detailEmpty}>
                <Text style={s.detailEmptyText}>Selecciona una receta para ver su detalle</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={recetasFiltradas}
            keyExtractor={item => item.id}
            renderItem={renderReceta}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
          />
          <View style={s.fabRow}>
            <TouchableOpacity style={[s.fab, s.fabRegister]} onPress={abrirCrear} activeOpacity={0.85}>
              <Text style={s.fabRegisterText}>+ Nueva receta</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal detalle (solo movil) */}
      {!isDesktop && (
        <Modal
          visible={modalDetalle}
          animationType="slide"
          transparent
          onRequestClose={() => setModalDetalle(false)}
        >
          <Pressable style={s.overlay} onPress={() => setModalDetalle(false)}>
            <Pressable style={s.bottomSheet} onPress={() => {}}>
              <View style={s.handle} />
              <View style={s.sheetHeader}>
                <Text style={s.sheetTitle} numberOfLines={1}>{recetaActual?.nombre}</Text>
                <TouchableOpacity onPress={() => setModalDetalle(false)}>
                  <Text style={s.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <DetalleContenido />
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Modal crear */}
      <FormReceta
        visible={modalCrear}
        titulo="Nueva receta"
        isDesktop={isDesktop}
        nombre={nombre}             setNombre={setNombre}
        categoria={categoria}       setCategoria={setCategoria}
        precio={precio}             setPrecio={setPrecio}
        ingredientes={ingredientes} setIngredientes={setIngredientes}
        onGuardar={crearReceta}
        onCerrar={() => setModalCrear(false)}
        colors={colors}
        s={s}
      />

      {/* Modal editar */}
      <FormReceta
        visible={modalEditar}
        titulo="Editar receta"
        isDesktop={isDesktop}
        nombre={nombre}             setNombre={setNombre}
        categoria={categoria}       setCategoria={setCategoria}
        precio={precio}             setPrecio={setPrecio}
        ingredientes={ingredientes} setIngredientes={setIngredientes}
        onGuardar={guardarEdicion}
        onCerrar={() => setModalEditar(false)}
        colors={colors}
        s={s}
      />

    </View>
  );
}

// ─── ESTILOS ──────────────────────────────────────────

const makeStyles = (c) =>
  StyleSheet.create({
    container:        { flex: 1, backgroundColor: c.bg },

    topbar:           { backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border, paddingHorizontal: 16, paddingVertical: 14 },
    topbarRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    topbarTitle:      { fontSize: 16, fontWeight: '600', color: c.textPrimary },
    topbarSub:        { fontSize: 12, color: c.textSecondary, marginTop: 1 },
    themeToggle:      { width: 36, height: 36, borderRadius: 10, backgroundColor: c.surface2, borderWidth: 0.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
    themeToggleIcon:  { fontSize: 18 },

    searchWrap:       { backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border, paddingHorizontal: 12, paddingVertical: 10 },
    searchRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
    searchInput:      { flex: 1, backgroundColor: c.surface2, borderWidth: 0.5, borderColor: c.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: c.textPrimary },
    searchClearBtn:   { width: 34, height: 34, borderRadius: 9, backgroundColor: c.surface2, borderWidth: 0.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
    searchClearIcon:  { fontSize: 13, color: c.textSecondary, fontWeight: '600' },

    categoriasWrap:          { backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border },
    categoriasScroll:        { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row' },
    categoriaChip:           { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: c.surface2, borderWidth: 0.5, borderColor: c.border },
    categoriaChipActive:     { backgroundColor: c.btnBg, borderColor: c.btnBg },
    categoriaChipText:       { fontSize: 12, color: c.textSecondary, fontWeight: '500' },
    categoriaChipTextActive: { color: c.btnText, fontWeight: '600' },

    listContent:      { padding: 12, paddingBottom: 90, gap: 8 },

    card:             { backgroundColor: c.surface, borderWidth: 0.5, borderColor: c.border, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardSelected:     { borderColor: c.btnBg, borderWidth: 1.5 },
    cardIcon:         { width: 38, height: 38, borderRadius: 10, backgroundColor: '#FAEEDA', alignItems: 'center', justifyContent: 'center' },
    cardIconText:     { fontSize: 15, fontWeight: '700', color: '#B07020' },
    cardInfo:         { flex: 1 },
    cardNombre:       { fontSize: 14, fontWeight: '500', color: c.textPrimary },
    cardSub:          { fontSize: 11, color: c.textSecondary, marginTop: 1 },
    cardRight:        { alignItems: 'flex-end' },
    cardCategoria:    { fontSize: 11, color: c.btnBg, fontWeight: '600', marginTop: 2 },
    precioNum:        { fontSize: 15, fontWeight: '600', color: c.textPrimary },
    precioLbl:        { fontSize: 11, color: c.textSecondary },

    categoriaBadge:     { alignSelf: 'flex-start', backgroundColor: c.surface2, borderWidth: 0.5, borderColor: c.border, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, marginTop: 3 },
    categoriaBadgeText: { fontSize: 10, color: c.textSecondary },

    badge:            { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
    badge_ok:         { backgroundColor: '#EAF3DE' },
    badge_out:        { backgroundColor: '#FCEBEB' },
    badgeText:        { fontSize: 10, fontWeight: '500' },
    badgeText_ok:     { color: '#27500A' },
    badgeText_out:    { color: '#791F1F' },

    fabRow:           { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 10, padding: 12, backgroundColor: c.surface, borderTopWidth: 0.5, borderTopColor: c.border },
    fabRowDesktop:    { position: 'relative', borderTopWidth: 0.5, borderTopColor: c.border },
    fab:              { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    fabRegister:      { backgroundColor: c.btnBg },
    fabRegisterText:  { fontSize: 13, fontWeight: '600', color: c.btnText },

    masterDetail:     { flex: 1, flexDirection: 'row' },
    masterPanel:      { flex: 1, borderRightWidth: 0.5, borderRightColor: c.border },
    detailPanel:      { flex: 1, backgroundColor: c.surface2 },
    detailEmpty:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
    detailEmptyText:  { fontSize: 14, color: c.textSecondary, textAlign: 'center' },

    overlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    bottomSheet:      { backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
    overlayDesktop:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    bottomSheetDesktop: { backgroundColor: c.surface, borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 12 },
    handle:           { width: 36, height: 4, backgroundColor: c.border, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
    sheetHeader:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: c.border },
    sheetTitle:       { fontSize: 15, fontWeight: '600', color: c.textPrimary, flex: 1 },
    closeBtn:         { fontSize: 18, color: c.textSecondary, paddingLeft: 12 },

    statsGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12 },
    statCard:         { flex: 1, minWidth: '45%', backgroundColor: c.surface2, borderRadius: 10, padding: 10 },
    statLabel:        { fontSize: 11, color: c.textSecondary, marginBottom: 3 },
    statValue:        { fontSize: 16, fontWeight: '500', color: c.textPrimary },
    statSub:          { fontSize: 11, color: c.textSecondary },

    infoBlock:        { marginHorizontal: 12, marginBottom: 10, borderWidth: 0.5, borderColor: c.border, borderRadius: 12, overflow: 'hidden' },
    blockTitle:       { fontSize: 12, fontWeight: '500', color: c.textSecondary, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: c.surface2, borderBottomWidth: 0.5, borderBottomColor: c.border },
    infoRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: c.border },
    infoKey:          { fontSize: 13, color: c.textSecondary },
    infoVal:          { fontSize: 13, color: c.textPrimary, fontWeight: '500', maxWidth: '55%', textAlign: 'right' },

    editBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginHorizontal: 12, marginTop: 4, borderWidth: 0.5, borderColor: c.border, borderRadius: 10, paddingVertical: 10 },
    editBtnText:      { fontSize: 13, color: c.textPrimary },

    formWrap:         { padding: 16, gap: 12 },
    formGroup:        { gap: 5 },
    formLabel:        { fontSize: 11, fontWeight: '600', color: c.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase' },
    formInput:        { backgroundColor: c.surface2, borderWidth: 0.5, borderColor: c.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: c.textPrimary },

    ingCard:          { backgroundColor: c.surface2, borderWidth: 0.5, borderColor: c.border, borderRadius: 12, padding: 12, marginTop: 8 },
    ingSubLabel:      { fontSize: 11, fontWeight: '600', color: c.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
    ingEliminar:      { fontSize: 13, color: '#791F1F', marginTop: 6 },

    dropdownBtn:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.surface2, borderWidth: 0.5, borderColor: c.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11 },
    dropdownBtnText:        { fontSize: 14, color: c.textPrimary, flex: 1 },
    dropdownBtnPlaceholder: { fontSize: 14, color: c.placeholder, flex: 1 },
    dropdownArrow:          { fontSize: 12, color: c.textSecondary, marginLeft: 8 },

    pickerOverlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 32 },
    pickerBox:              { backgroundColor: c.surface, borderRadius: 16, width: '100%', maxWidth: 360, maxHeight: 380, overflow: 'hidden' },
    pickerHeader:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 0.5, borderBottomColor: c.border },
    pickerTitle:            { fontSize: 14, fontWeight: '600', color: c.textPrimary },
    pickerOption:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 0.5, borderBottomColor: c.border },
    pickerOptionActive:     { backgroundColor: c.surface2 },
    pickerOptionText:       { fontSize: 14, color: c.textPrimary },
    pickerOptionTextActive: { fontWeight: '600', color: c.btnBg },
    pickerCheck:            { fontSize: 15, color: c.btnBg, fontWeight: '600' },

    addIngBtn:        { marginTop: 10, borderWidth: 0.5, borderColor: c.border, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderStyle: 'dashed' },
    addIngText:       { fontSize: 13, color: c.textSecondary },

    btnPrimary:       { backgroundColor: c.btnBg, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
    btnPrimaryText:   { color: c.btnText, fontSize: 15, fontWeight: '600' },
  });