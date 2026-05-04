import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Pressable, Modal, StyleSheet, FlatList,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

// ─── Datos de ejemplo ─────────────────────────────────────────────────────────
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const HOY_IDX = new Date().getDay();

const STOCK_DATA = [
  { id: '1', nombre: 'Pollo (kg)',        local: 'comida',    qty: 0.5, min: 5,  max: 20,  unit: 'kg' },
  { id: '2', nombre: 'Pan de completo',   local: 'comida',    qty: 8,   min: 30, max: 100, unit: 'un' },
  { id: '3', nombre: 'Carne molida (kg)', local: 'comida',    qty: 1.2, min: 4,  max: 15,  unit: 'kg' },
  { id: '4', nombre: 'Aceite (lt)',       local: 'cafeteria', qty: 0.3, min: 2,  max: 8,   unit: 'lt' },
  { id: '5', nombre: 'Harina (kg)',       local: 'cafeteria', qty: 3.5, min: 5,  max: 25,  unit: 'kg' },
  { id: '6', nombre: 'Café (kg)',         local: 'cafeteria', qty: 0.4, min: 1.5,max: 5,   unit: 'kg' },
  { id: '7', nombre: 'Azúcar (kg)',       local: 'almacen',   qty: 2.1, min: 3,  max: 20,  unit: 'kg' },
  { id: '8', nombre: 'Arroz (kg)',        local: 'almacen',   qty: 12,  min: 5,  max: 30,  unit: 'kg' },
  { id: '9', nombre: 'Tomate (kg)',       local: 'almacen',   qty: 4.8, min: 3,  max: 15,  unit: 'kg' },
];

const PROVEEDORES = [
  { id: 'p1', nombre: 'Distribuidora El Pollo',  initials: 'DP', tipo: 'Carnes y aves',      locales: ['comida'],               dias: [1, 4], contacto: 'Juan Pérez',  telefono: '+56 9 1234 5678' },
  { id: 'p2', nombre: 'Panificadora Central',    initials: 'PC', tipo: 'Pan y masas',         locales: ['comida', 'cafeteria'],  dias: [2, 5], contacto: 'María López', telefono: '+56 9 8765 4321' },
  { id: 'p3', nombre: 'Almacén Santiago SpA',    initials: 'AS', tipo: 'Abarrotes generales', locales: ['almacen', 'cafeteria'], dias: [1, 3, 5], contacto: 'Carlos Ruiz', telefono: '+56 9 5555 1234' },
  { id: 'p4', nombre: 'Café & Co.',              initials: 'CC', tipo: 'Insumos cafetería',   locales: ['cafeteria'],            dias: [3],    contacto: 'Ana Soto',    telefono: '+56 9 9999 8888' },
];

const LOCAL_LABELS = { comida: 'Comida Rápida', almacen: 'Almacén', cafeteria: 'Cafetería' };
const LOCAL_COLORS = {
  comida:    { bg: '#E6F1FB', text: '#0C447C' },
  almacen:   { bg: '#EAF3DE', text: '#27500A' },
  cafeteria: { bg: '#FAEEDA', text: '#633806' },
};

const LOCALES_FILTRO = [
  { id: 'todos',    label: 'Todos' },
  { id: 'comida',   label: 'Comida Rápida' },
  { id: 'almacen',  label: 'Almacén' },
  { id: 'cafeteria',label: 'Cafetería' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getLevel(item) {
  const pct = item.qty / item.min;
  if (pct <= 0)   return 'out';
  if (pct <= 0.3) return 'critical';
  if (pct <= 1)   return 'low';
  return 'ok';
}

function getPct(item) {
  return Math.min(100, Math.round((item.qty / item.max) * 100));
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ label, level, colors }) {
  const map = {
    critical: { bg: '#FCEBEB', text: '#791F1F' },
    out:      { bg: '#FCEBEB', text: '#791F1F' },
    low:      { bg: '#FAEEDA', text: '#633806' },
    ok:       { bg: '#EAF3DE', text: '#27500A' },
    info:     { bg: '#E6F1FB', text: '#0C447C' },
  };
  const col = map[level] || map.ok;
  return (
    <View style={[s.badge, { backgroundColor: col.bg }]}>
      <Text style={[s.badgeText, { color: col.text }]}>{label}</Text>
    </View>
  );
}

// ─── LocalChip ────────────────────────────────────────────────────────────────
function LocalChip({ local }) {
  const col = LOCAL_COLORS[local] || { bg: '#F8F9FA', text: '#7F8C8D' };
  return (
    <View style={[s.chip, { backgroundColor: col.bg }]}>
      <Text style={[s.chipText, { color: col.text }]}>{LOCAL_LABELS[local] || local}</Text>
    </View>
  );
}

// ─── StockBar ─────────────────────────────────────────────────────────────────
function StockBar({ pct, level }) {
  const color = level === 'ok' ? '#639922' : ['critical', 'out'].includes(level) ? '#E24B4A' : '#BA7517';
  return (
    <View style={s.barWrap}>
      <View style={s.barBg}>
        <View style={[s.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={s.barPct}>{pct}%</Text>
    </View>
  );
}

// ─── Tarjeta de alerta de stock ───────────────────────────────────────────────
function StockAlertCard({ item, onVerDetalle }) {
  const level = getLevel(item);
  const pct   = getPct(item);
  const isCritical = ['critical', 'out'].includes(level);
  const accentColor = isCritical ? '#E24B4A' : level === 'low' ? '#BA7517' : '#639922';
  const badgeLabel  = level === 'out' ? 'Sin stock' : isCritical ? 'Crítico' : 'Stock bajo';
  const badgeLevel  = isCritical ? 'critical' : 'low';

  return (
    <Pressable
      onPress={() => onVerDetalle(item)}
      style={({ pressed }) => [
        s.alertCard,
        { borderLeftColor: accentColor, borderLeftWidth: 3, borderRadius: 0 },
        { borderTopRightRadius: 12, borderBottomRightRadius: 12 },
        pressed && { backgroundColor: '#F8F9FA' },
      ]}
    >
      {/* Ícono */}
      <View style={[s.alertIcon, { backgroundColor: isCritical ? '#FCEBEB' : '#FAEEDA' }]}>
        <Text style={{ fontSize: 16 }}>{isCritical ? '⚠️' : '↓'}</Text>
      </View>

      {/* Info */}
      <View style={s.alertInfo}>
        <Text style={s.alertNombre}>{item.nombre}</Text>
        <Text style={s.alertMeta}>
          Actual: <Text style={{ color: '#2C3E50', fontWeight: '600' }}>{item.qty} {item.unit}</Text>
          {'  ·  '}Mínimo: {item.min} {item.unit}
        </Text>
        <View style={{ marginTop: 5 }}>
          <LocalChip local={item.local} />
        </View>
      </View>

      {/* Barra + badge */}
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <StockBar pct={pct} level={level} />
        <Badge label={badgeLabel} level={badgeLevel} />
      </View>
    </Pressable>
  );
}

// ─── Tarjeta de proveedor ─────────────────────────────────────────────────────
function ProveedorCard({ proveedor, onVerDetalle }) {
  const visitaHoy = proveedor.dias.includes(HOY_IDX);
  return (
    <Pressable
      onPress={() => onVerDetalle(proveedor)}
      style={({ pressed }) => [
        s.provCard,
        visitaHoy && { borderLeftColor: '#BA7517', borderLeftWidth: 3, borderRadius: 0, borderTopRightRadius: 12, borderBottomRightRadius: 12 },
        pressed && { backgroundColor: '#F8F9FA' },
      ]}
    >
      {/* Avatar */}
      <View style={s.avatar}>
        <Text style={s.avatarText}>{proveedor.initials}</Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View style={s.row}>
          <Text style={s.provNombre}>{proveedor.nombre}</Text>
          {visitaHoy && <Badge label="Hoy" level="low" />}
        </View>
        <Text style={s.provTipo}>{proveedor.tipo}</Text>

        {/* Locales */}
        <View style={[s.row, { marginTop: 6, flexWrap: 'wrap', gap: 4 }]}>
          {proveedor.locales.map(l => <LocalChip key={l} local={l} />)}
        </View>

        {/* Días */}
        <View style={[s.row, { marginTop: 5, flexWrap: 'wrap', gap: 4 }]}>
          {proveedor.dias.map(d => (
            <View
              key={d}
              style={[s.diaChip, d === HOY_IDX && { backgroundColor: '#FAEEDA', borderColor: '#FAC775' }]}
            >
              <Text style={[s.diaChipText, d === HOY_IDX && { color: '#633806', fontWeight: '600' }]}>
                {DIAS[d]}{d === HOY_IDX ? ' · Hoy' : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

// ─── Modal detalle stock ──────────────────────────────────────────────────────
function ModalDetalleStock({ item, onClose }) {
  if (!item) return null;
  const level = getLevel(item);
  const pct   = getPct(item);
  const isCritical = ['critical', 'out'].includes(level);
  const barColor = isCritical ? '#E24B4A' : level === 'low' ? '#BA7517' : '#639922';

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.modalOverlay} onPress={onClose}>
        <Pressable style={s.modalSheet} onPress={() => {}}>
          {/* Handle */}
          <View style={s.handle} />

          {/* Encabezado */}
          <View style={[s.row, { justifyContent: 'space-between', marginBottom: 16 }]}>
            <View>
              <Text style={s.modalTitle}>{item.nombre}</Text>
              <View style={{ marginTop: 4 }}>
                <LocalChip local={item.local} />
              </View>
            </View>
            <Pressable onPress={onClose}>
              <Text style={s.closeBtn}>✕</Text>
            </Pressable>
          </View>

          {/* Stats */}
          <View style={[s.row, { gap: 8, marginBottom: 16 }]}>
            {[
              { label: 'Stock actual', value: `${item.qty} ${item.unit}` },
              { label: 'Stock mínimo', value: `${item.min} ${item.unit}` },
              { label: 'Porcentaje',   value: `${pct}%` },
            ].map((stat, i) => (
              <View key={i} style={s.statBox}>
                <Text style={s.statLabel}>{stat.label}</Text>
                <Text style={s.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>

          {/* Barra grande */}
          <View style={{ marginBottom: 16 }}>
            <View style={[s.row, { justifyContent: 'space-between', marginBottom: 6 }]}>
              <Text style={s.label}>Nivel de stock</Text>
              <Badge
                label={level === 'out' ? 'Sin stock' : isCritical ? 'Crítico' : level === 'low' ? 'Stock bajo' : 'Normal'}
                level={isCritical ? 'critical' : level === 'low' ? 'low' : 'ok'}
              />
            </View>
            <View style={s.bigBarBg}>
              <View style={[s.bigBarFill, { width: `${pct}%`, backgroundColor: barColor }]} />
            </View>
            <View style={[s.row, { justifyContent: 'space-between', marginTop: 4 }]}>
              <Text style={s.barLabel}>0 {item.unit}</Text>
              <Text style={s.barLabel}>{item.max} {item.unit}</Text>
            </View>
          </View>

          {/* Recomendación */}
          <View style={s.infoBox}>
            <Text style={s.infoTitle}>Recomendación</Text>
            <Text style={s.infoText}>
              {isCritical
                ? `Solicitar reposición urgente. Faltan ${(item.min - item.qty).toFixed(1)} ${item.unit} para alcanzar el mínimo.`
                : `Considerar pedido pronto. Stock actual es ${pct}% del máximo.`}
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Modal detalle proveedor ──────────────────────────────────────────────────
function ModalDetalleProveedor({ proveedor, onClose }) {
  if (!proveedor) return null;
  const visitaHoy = proveedor.dias.includes(HOY_IDX);

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.modalOverlay} onPress={onClose}>
        <Pressable style={s.modalSheet} onPress={() => {}}>
          <View style={s.handle} />

          {/* Encabezado */}
          <View style={[s.row, { justifyContent: 'space-between', marginBottom: 16 }]}>
            <View style={s.row}>
              <View style={s.avatarLg}>
                <Text style={s.avatarLgText}>{proveedor.initials}</Text>
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={s.modalTitle}>{proveedor.nombre}</Text>
                <Text style={s.provTipo}>{proveedor.tipo}</Text>
              </View>
            </View>
            <Pressable onPress={onClose}>
              <Text style={s.closeBtn}>✕</Text>
            </Pressable>
          </View>

          {/* Info rows */}
          <View style={[s.infoTable, { marginBottom: 14 }]}>
            {[
              { k: 'Contacto',      v: proveedor.contacto },
              { k: 'Teléfono',      v: proveedor.telefono },
              { k: 'Días de visita',v: proveedor.dias.map(d => DIAS[d]).join(' · ') },
            ].map((row, i) => (
              <View key={i} style={[s.infoRow, i < 2 && { borderBottomWidth: 0.5, borderBottomColor: '#E2E6EA' }]}>
                <Text style={s.infoKey}>{row.k}</Text>
                <Text style={s.infoVal}>{row.v}</Text>
              </View>
            ))}
          </View>

          {/* Locales */}
          <Text style={[s.label, { marginBottom: 7 }]}>LOCALES ABASTECIDOS</Text>
          <View style={[s.row, { gap: 6, marginBottom: 14, flexWrap: 'wrap' }]}>
            {proveedor.locales.map(l => <LocalChip key={l} local={l} />)}
          </View>

          {/* Aviso si visita hoy */}
          {visitaHoy && (
            <View style={s.warningBox}>
              <Text style={{ fontSize: 18 }}>📋</Text>
              <Text style={s.warningText}>
                Este proveedor visita hoy. Recuerda preparar el pedido.
              </Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function AlertasScreen() {
  const { colors } = useTheme();
  const [activeTab,   setActiveTab]   = useState('stock');
  const [activeLocal, setActiveLocal] = useState('todos');
  const [modalStock,  setModalStock]  = useState(null);
  const [modalProv,   setModalProv]   = useState(null);

  // Filtrado
  const stockFiltrado = activeLocal === 'todos'
    ? STOCK_DATA
    : STOCK_DATA.filter(i => i.local === activeLocal);

  const criticos = stockFiltrado.filter(i => ['critical', 'out'].includes(getLevel(i)));
  const bajos    = stockFiltrado.filter(i => getLevel(i) === 'low');

  // Contadores globales
  const cntCritico = STOCK_DATA.filter(i => ['critical', 'out'].includes(getLevel(i))).length;
  const cntBajo    = STOCK_DATA.filter(i => getLevel(i) === 'low').length;
  const cntHoy     = PROVEEDORES.filter(p => p.dias.includes(HOY_IDX)).length;

  const provOrdenados = [...PROVEEDORES].sort((a, b) =>
    b.dias.includes(HOY_IDX) - a.dias.includes(HOY_IDX)
  );

  return (
    <View style={[s.screen, { backgroundColor: colors.bg }]}>

      {/* ── Header ── */}
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Alertas del sistema</Text>
        <Text style={[s.headerSub,   { color: colors.textSecondary }]}>
          Inventario y proveedores · 3 locales
        </Text>
      </View>

      {/* ── Métricas resumen ── */}
      <View style={s.metricsRow}>
        {[
          { label: 'Stock crítico',    value: cntCritico, color: '#E24B4A' },
          { label: 'Stock bajo',       value: cntBajo,    color: '#BA7517' },
          { label: 'Proveedores hoy',  value: cntHoy || PROVEEDORES.length, color: '#639922' },
        ].map((m, i) => (
          <View key={i} style={[s.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.metricLabel, { color: colors.textSecondary }]}>{m.label}</Text>
            <Text style={[s.metricValue, { color: m.color }]}>{m.value}</Text>
          </View>
        ))}
      </View>

      {/* ── Tabs ── */}
      <View style={[s.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {[{ id: 'stock', label: 'Stock' }, { id: 'proveedores', label: 'Proveedores' }].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[s.tab, activeTab === tab.id && s.tabActive]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[s.tabText, { color: activeTab === tab.id ? colors.textPrimary : colors.textSecondary },
              activeTab === tab.id && { fontWeight: '600' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Contenido ── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* STOCK */}
        {activeTab === 'stock' && (
          <View>
            {/* Filtro por local */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <View style={s.filtroRow}>
                {LOCALES_FILTRO.map(loc => (
                  <TouchableOpacity
                    key={loc.id}
                    onPress={() => setActiveLocal(loc.id)}
                    style={[
                      s.filtroBtn,
                      { borderColor: activeLocal === loc.id ? colors.textPrimary : colors.border },
                      activeLocal === loc.id && { backgroundColor: colors.btnBg },
                    ]}
                    activeOpacity={0.75}
                  >
                    <Text style={[
                      s.filtroBtnText,
                      { color: activeLocal === loc.id ? colors.btnText : colors.textSecondary },
                      activeLocal === loc.id && { fontWeight: '600' },
                    ]}>
                      {loc.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Crítico */}
            <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>
              CRÍTICO · {criticos.length} PRODUCTO{criticos.length !== 1 ? 'S' : ''}
            </Text>
            <View style={s.list}>
              {criticos.length === 0
                ? <View style={[s.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Sin alertas críticas para este local</Text>
                  </View>
                : criticos.map(item => (
                    <StockAlertCard key={item.id} item={item} onVerDetalle={setModalStock} />
                  ))
              }
            </View>

            {/* Stock bajo */}
            <Text style={[s.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
              STOCK BAJO · {bajos.length} PRODUCTO{bajos.length !== 1 ? 'S' : ''}
            </Text>
            <View style={s.list}>
              {bajos.length === 0
                ? <View style={[s.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Sin stock bajo para este local</Text>
                  </View>
                : bajos.map(item => (
                    <StockAlertCard key={item.id} item={item} onVerDetalle={setModalStock} />
                  ))
              }
            </View>
          </View>
        )}

        {/* PROVEEDORES */}
        {activeTab === 'proveedores' && (
          <View>
            <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>
              RECORDATORIOS DE VISITA · {PROVEEDORES.length} PROVEEDORES
            </Text>
            <View style={s.list}>
              {provOrdenados.map(p => (
                <ProveedorCard key={p.id} proveedor={p} onVerDetalle={setModalProv} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Modales ── */}
      <ModalDetalleStock    item={modalStock}      onClose={() => setModalStock(null)} />
      <ModalDetalleProveedor proveedor={modalProv} onClose={() => setModalProv(null)} />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen:          { flex: 1 },

  // Header
  header:          { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  headerTitle:     { fontSize: 18, fontWeight: '700' },
  headerSub:       { fontSize: 13, marginTop: 2 },

  // Métricas
  metricsRow:      { flexDirection: 'row', gap: 10, padding: 14, paddingBottom: 0 },
  metricCard:      { flex: 1, borderWidth: 0.5, borderRadius: 12, padding: 12 },
  metricLabel:     { fontSize: 11, marginBottom: 4 },
  metricValue:     { fontSize: 24, fontWeight: '700' },

  // Tabs
  tabBar:          { flexDirection: 'row', borderBottomWidth: 0.5, marginTop: 14 },
  tab:             { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:       { borderBottomColor: '#2C3E50' },
  tabText:         { fontSize: 14 },

  // Scroll
  scrollContent:   { padding: 14, paddingBottom: 40 },

  // Filtro
  filtroRow:       { flexDirection: 'row', gap: 7 },
  filtroBtn:       { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 100, borderWidth: 0.5 },
  filtroBtnText:   { fontSize: 12 },

  // Sección
  sectionLabel:    { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, marginBottom: 8 },
  list:            { gap: 8 },
  emptyCard:       { borderWidth: 0.5, borderRadius: 12, padding: 20, alignItems: 'center' },

  // Alerta de stock
  alertCard:       { backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: '#E2E6EA', flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  alertIcon:       { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  alertInfo:       { flex: 1, minWidth: 0 },
  alertNombre:     { fontSize: 14, fontWeight: '500', color: '#2C3E50' },
  alertMeta:       { fontSize: 12, color: '#7F8C8D', marginTop: 2 },

  // StockBar
  barWrap:         { width: 72 },
  barBg:           { height: 5, backgroundColor: '#E2E6EA', borderRadius: 3, overflow: 'hidden' },
  barFill:         { height: '100%', borderRadius: 3 },
  barPct:          { fontSize: 11, color: '#7F8C8D', textAlign: 'right', marginTop: 2 },

  // Badge
  badge:           { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  badgeText:       { fontSize: 11, fontWeight: '600' },

  // LocalChip
  chip:            { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, alignSelf: 'flex-start' },
  chipText:        { fontSize: 11, fontWeight: '500' },

  // Proveedor card
  provCard:        { backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: '#E2E6EA', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:          { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E6F1FB', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText:      { fontSize: 13, fontWeight: '700', color: '#0C447C' },
  provNombre:      { fontSize: 14, fontWeight: '500', color: '#2C3E50', flex: 1 },
  provTipo:        { fontSize: 12, color: '#7F8C8D', marginTop: 2 },
  diaChip:         { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, backgroundColor: '#F8F9FA', borderWidth: 0.5, borderColor: '#E2E6EA' },
  diaChipText:     { fontSize: 11, color: '#7F8C8D' },
  row:             { flexDirection: 'row', alignItems: 'center' },

  // Modal
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet:      { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  handle:          { width: 36, height: 4, backgroundColor: '#E2E6EA', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle:      { fontSize: 17, fontWeight: '700', color: '#2C3E50' },
  closeBtn:        { fontSize: 20, color: '#7F8C8D', paddingHorizontal: 4 },

  // Stats modal
  statBox:         { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12 },
  statLabel:       { fontSize: 11, color: '#7F8C8D', marginBottom: 4 },
  statValue:       { fontSize: 16, fontWeight: '700', color: '#2C3E50' },

  // Barra grande modal
  bigBarBg:        { height: 10, backgroundColor: '#E2E6EA', borderRadius: 5, overflow: 'hidden' },
  bigBarFill:      { height: '100%', borderRadius: 5 },
  barLabel:        { fontSize: 11, color: '#7F8C8D' },
  label:           { fontSize: 11, fontWeight: '600', color: '#7F8C8D', letterSpacing: 0.8 },

  // Info box (recomendación)
  infoBox:         { backgroundColor: '#E6F1FB', borderWidth: 0.5, borderColor: '#B5D4F4', borderRadius: 10, padding: 12 },
  infoTitle:       { fontSize: 12, fontWeight: '700', color: '#0C447C', marginBottom: 4 },
  infoText:        { fontSize: 13, color: '#0C447C' },

  // Info table (proveedor)
  infoTable:       { borderWidth: 0.5, borderColor: '#E2E6EA', borderRadius: 12, overflow: 'hidden' },
  infoRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, paddingHorizontal: 14 },
  infoKey:         { fontSize: 13, color: '#7F8C8D' },
  infoVal:         { fontSize: 13, fontWeight: '500', color: '#2C3E50' },

  // Avatar grande (modal proveedor)
  avatarLg:        { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E6F1FB', alignItems: 'center', justifyContent: 'center' },
  avatarLgText:    { fontSize: 15, fontWeight: '700', color: '#0C447C' },

  // Warning box
  warningBox:      { backgroundColor: '#FAEEDA', borderWidth: 0.5, borderColor: '#FAC775', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  warningText:     { fontSize: 13, color: '#633806', fontWeight: '500', flex: 1 },
});