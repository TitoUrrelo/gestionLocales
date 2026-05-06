import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Pressable, Modal, StyleSheet, TextInput, FlatList,
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

// ─── Datos de ejemplo: productos por vencer ───────────────────────────────────
const VENCIMIENTOS_DATA = [
  { id: 'v1', nombre: 'Leche descremada', local: 'cafeteria', vence: 1, unit: 'día',   qty: 6,  unitQty: 'lt',  lote: 'L-2024-087' },
  { id: 'v2', nombre: 'Queso laminado',   local: 'comida',    vence: 2, unit: 'días',  qty: 12, unitQty: 'un',  lote: 'L-2024-112' },
  { id: 'v3', nombre: 'Yogur natural',    local: 'almacen',   vence: 2, unit: 'días',  qty: 8,  unitQty: 'un',  lote: 'L-2024-095' },
  { id: 'v4', nombre: 'Crema de leche',   local: 'cafeteria', vence: 4, unit: 'días',  qty: 3,  unitQty: 'lt',  lote: 'L-2024-101' },
  { id: 'v5', nombre: 'Jamón serrano',    local: 'comida',    vence: 5, unit: 'días',  qty: 2,  unitQty: 'kg',  lote: 'L-2024-088' },
  { id: 'v6', nombre: 'Mantequilla',      local: 'almacen',   vence: 6, unit: 'días',  qty: 4,  unitQty: 'un',  lote: 'L-2024-099' },
  { id: 'v7', nombre: 'Huevos frescos',   local: 'comida',    vence: 7, unit: 'días',  qty: 30, unitQty: 'un',  lote: 'L-2024-110' },
];

const PROVEEDORES_INIT = [
  { id: 'p1', nombre: 'Distribuidora El Pollo',  initials: 'DP', empresa: 'El Pollo SpA',         tipo: 'Carnes y aves',      locales: ['comida'],               dias: [1, 4],    contacto: 'Juan Pérez',  telefono: '+56 9 1234 5678' },
  { id: 'p2', nombre: 'Panificadora Central',    initials: 'PC', empresa: 'Panificadora Central',  tipo: 'Pan y masas',         locales: ['comida', 'cafeteria'],  dias: [2, 5],    contacto: 'María López', telefono: '+56 9 8765 4321' },
  { id: 'p3', nombre: 'Almacén Santiago SpA',    initials: 'AS', empresa: 'Santiago SpA',           tipo: 'Abarrotes generales', locales: ['almacen', 'cafeteria'], dias: [1, 3, 5], contacto: 'Carlos Ruiz', telefono: '+56 9 5555 1234' },
  { id: 'p4', nombre: 'Café & Co.',              initials: 'CC', empresa: 'Café & Co. Ltda.',       tipo: 'Insumos cafetería',   locales: ['cafeteria'],            dias: [3],       contacto: 'Ana Soto',    telefono: '+56 9 9999 8888' },
];

const LOCAL_LABELS = { comida: 'Comida Rápida', almacen: 'Almacén', cafeteria: 'Cafetería' };
const LOCAL_COLORS = {
  comida:    { bg: '#E6F1FB', text: '#0C447C' },
  almacen:   { bg: '#EAF3DE', text: '#27500A' },
  cafeteria: { bg: '#FAEEDA', text: '#633806' },
};
const LOCALES_LIST = ['comida', 'almacen', 'cafeteria'];

const LOCALES_FILTRO = [
  { id: 'todos',    label: 'Todos' },
  { id: 'comida',   label: 'Comida Rápida' },
  { id: 'almacen',  label: 'Almacén' },
  { id: 'cafeteria',label: 'Cafetería' },
];

const DIAS_SEMANA = [
  { idx: 1, label: 'Lun' },
  { idx: 2, label: 'Mar' },
  { idx: 3, label: 'Mié' },
  { idx: 4, label: 'Jue' },
  { idx: 5, label: 'Vie' },
  { idx: 6, label: 'Sáb' },
  { idx: 0, label: 'Dom' },
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

function getVencLevel(dias) {
  if (dias <= 1) return 'critical';
  if (dias <= 3) return 'warning';
  return 'soon';
}

function getInitials(nombre) {
  return nombre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ label, level }) {
  const map = {
    critical: { bg: '#FCEBEB', text: '#791F1F' },
    out:      { bg: '#FCEBEB', text: '#791F1F' },
    low:      { bg: '#FAEEDA', text: '#633806' },
    warning:  { bg: '#FAEEDA', text: '#633806' },
    ok:       { bg: '#EAF3DE', text: '#27500A' },
    soon:     { bg: '#EAF3DE', text: '#27500A' },
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
      <View style={[s.alertIcon, { backgroundColor: isCritical ? '#FCEBEB' : '#FAEEDA' }]}>
        <Text style={{ fontSize: 16 }}>{isCritical ? '⚠️' : '↓'}</Text>
      </View>
      <View style={s.alertInfo}>
        <Text style={s.alertNombre}>{item.nombre}</Text>
        <Text style={s.alertMeta}>
          Actual: <Text style={{ color: '#2C3E50', fontWeight: '600' }}>{item.qty} {item.unit}</Text>
          {'  ·  '}Mínimo: {item.min} {item.unit}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <StockBar pct={pct} level={level} />
        <Badge label={badgeLabel} level={badgeLevel} />
      </View>
    </Pressable>
  );
}

// ─── Tarjeta de vencimiento ───────────────────────────────────────────────────
function VencimientoCard({ item, onVerDetalle }) {
  const level = getVencLevel(item.vence);
  const isCritical = level === 'critical';
  const accentColor = isCritical ? '#E24B4A' : level === 'warning' ? '#BA7517' : '#639922';
  const badgeLabel  = isCritical ? '¡Hoy/Mañana!' : level === 'warning' ? `${item.vence} días` : `${item.vence} días`;
  const icon        = isCritical ? '🚨' : level === 'warning' ? '⏳' : '📅';

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
      <View style={[s.alertIcon, { backgroundColor: isCritical ? '#FCEBEB' : level === 'warning' ? '#FAEEDA' : '#EAF3DE' }]}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <View style={s.alertInfo}>
        <Text style={s.alertNombre}>{item.nombre}</Text>
        <Text style={s.alertMeta}>
          Cantidad: <Text style={{ color: '#2C3E50', fontWeight: '600' }}>{item.qty} {item.unitQty}</Text>
          {'  ·  '}Lote: {item.lote}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <Badge label={badgeLabel} level={level} />
        <Text style={[s.barPct, { textAlign: 'right' }]}>Vence en</Text>
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
      <View style={s.avatar}>
        <Text style={s.avatarText}>{proveedor.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.row}>
          <Text style={s.provNombre}>{proveedor.nombre}</Text>
          {visitaHoy && <Badge label="Hoy" level="low" />}
        </View>
        <Text style={s.provTipo}>{proveedor.empresa}</Text>
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
          <View style={s.handle} />
          <View style={[s.row, { justifyContent: 'space-between', marginBottom: 16 }]}>
            <View>
              <Text style={s.modalTitle}>{item.nombre}</Text>
              <View style={{ marginTop: 4 }}>
                <LocalChip local={item.local} />
              </View>
            </View>
            <Pressable onPress={onClose}><Text style={s.closeBtn}>✕</Text></Pressable>
          </View>
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

// ─── Modal detalle vencimiento ────────────────────────────────────────────────
function ModalDetalleVencimiento({ item, onClose }) {
  if (!item) return null;
  const level = getVencLevel(item.vence);
  const isCritical = level === 'critical';
  const barColor = isCritical ? '#E24B4A' : level === 'warning' ? '#BA7517' : '#639922';

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.modalOverlay} onPress={onClose}>
        <Pressable style={s.modalSheet} onPress={() => {}}>
          <View style={s.handle} />
          <View style={[s.row, { justifyContent: 'space-between', marginBottom: 16 }]}>
            <View>
              <Text style={s.modalTitle}>{item.nombre}</Text>
              <View style={{ marginTop: 4 }}>
                <LocalChip local={item.local} />
              </View>
            </View>
            <Pressable onPress={onClose}><Text style={s.closeBtn}>✕</Text></Pressable>
          </View>
          <View style={[s.row, { gap: 8, marginBottom: 16 }]}>
            {[
              { label: 'Vence en',  value: `${item.vence} ${item.unit}` },
              { label: 'Cantidad',  value: `${item.qty} ${item.unitQty}` },
              { label: 'Lote',      value: item.lote },
            ].map((stat, i) => (
              <View key={i} style={s.statBox}>
                <Text style={s.statLabel}>{stat.label}</Text>
                <Text style={[s.statValue, { fontSize: 13 }]}>{stat.value}</Text>
              </View>
            ))}
          </View>
          <View style={[s.warningBox, {
            backgroundColor: isCritical ? '#FCEBEB' : level === 'warning' ? '#FAEEDA' : '#EAF3DE',
            borderColor: isCritical ? '#F5A6A6' : level === 'warning' ? '#FAC775' : '#B8DFA0',
          }]}>
            <Text style={{ fontSize: 18 }}>{isCritical ? '🚨' : level === 'warning' ? '⏳' : '📅'}</Text>
            <Text style={[s.warningText, {
              color: isCritical ? '#791F1F' : level === 'warning' ? '#633806' : '#27500A',
            }]}>
              {isCritical
                ? 'Producto vence hoy o mañana. Revisar uso urgente o retirar del inventario.'
                : level === 'warning'
                  ? `Producto vence en ${item.vence} días. Priorizar su uso.`
                  : `Vence en ${item.vence} días. Monitorear consumo.`}
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

  // Stock crítico/bajo de los locales que abastece este proveedor
  const stockRecomendado = STOCK_DATA.filter(item =>
    proveedor.locales.includes(item.local) &&
    ['critical', 'out', 'low'].includes(getLevel(item))
  ).sort((a, b) => {
    const order = { out: 0, critical: 1, low: 2 };
    return order[getLevel(a)] - order[getLevel(b)];
  });

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.modalOverlay} onPress={onClose}>
        <Pressable style={[s.modalSheet, { maxHeight: '88%' }]} onPress={() => {}}>
          <View style={s.handle} />
          <View style={[s.row, { justifyContent: 'space-between', marginBottom: 16 }]}>
            <View style={s.row}>
              <View style={s.avatarLg}>
                <Text style={s.avatarLgText}>{proveedor.initials}</Text>
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={s.modalTitle}>{proveedor.nombre}</Text>
                <Text style={s.provTipo}>{proveedor.empresa}</Text>
              </View>
            </View>
            <Pressable onPress={onClose}><Text style={s.closeBtn}>✕</Text></Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[s.infoTable, { marginBottom: 14 }]}>
              {[
                { k: 'Empresa',       v: proveedor.empresa },
                { k: 'Teléfono',      v: proveedor.telefono },
                { k: 'Días de visita',v: proveedor.dias.map(d => DIAS[d]).join(' · ') },
              ].map((row, i, arr) => (
                <View key={i} style={[s.infoRow, i < arr.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: '#E2E6EA' }]}>
                  <Text style={s.infoKey}>{row.k}</Text>
                  <Text style={s.infoVal}>{row.v}</Text>
                </View>
              ))}
            </View>

            <Text style={[s.label, { marginBottom: 7 }]}>LOCALES ABASTECIDOS</Text>
            <View style={[s.row, { gap: 6, marginBottom: 14, flexWrap: 'wrap' }]}>
              {proveedor.locales.map(l => <LocalChip key={l} local={l} />)}
            </View>

            {visitaHoy && (
              <View style={[s.warningBox, { marginBottom: 16 }]}>
                <Text style={{ fontSize: 18 }}>📋</Text>
                <Text style={s.warningText}>Este proveedor visita hoy. Recuerda preparar el pedido.</Text>
              </View>
            )}

            {/* ── Recomendación de compra ── */}
            <Text style={[s.label, { marginBottom: 10 }]}>
              SUGERENCIA DE COMPRA · {stockRecomendado.length} PRODUCTO{stockRecomendado.length !== 1 ? 'S' : ''}
            </Text>

            {stockRecomendado.length === 0 ? (
              <View style={s.recomEmptyBox}>
                <Text style={{ fontSize: 20, marginBottom: 6 }}>✅</Text>
                <Text style={s.recomEmptyText}>Sin stock crítico en los locales de este proveedor</Text>
              </View>
            ) : (
              <View style={{ gap: 8, marginBottom: 8 }}>
                {stockRecomendado.map(item => {
                  const level = getLevel(item);
                  const isCritical = ['critical', 'out'].includes(level);
                  const accentColor = isCritical ? '#E24B4A' : '#BA7517';
                  const bgColor     = isCritical ? '#FCEBEB' : '#FAEEDA';
                  const textColor   = isCritical ? '#791F1F' : '#633806';
                  const faltante    = Math.max(0, item.min - item.qty);
                  const badgeLabel  = level === 'out' ? 'Sin stock' : isCritical ? 'Crítico' : 'Stock bajo';

                  return (
                    <View
                      key={item.id}
                      style={[s.recomCard, { borderLeftColor: accentColor }]}
                    >
                      {/* Icono + nombre */}
                      <View style={[s.recomIcon, { backgroundColor: bgColor }]}>
                        <Text style={{ fontSize: 14 }}>{isCritical ? '⚠️' : '↓'}</Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={[s.row, { justifyContent: 'space-between', marginBottom: 2 }]}>
                          <Text style={s.recomNombre} numberOfLines={1}>{item.nombre}</Text>
                          <Badge label={badgeLabel} level={isCritical ? 'critical' : 'low'} />
                        </View>
                        <View style={s.row}>
                          <LocalChip local={item.local} />
                        </View>
                        <View style={[s.row, { marginTop: 6, justifyContent: 'space-between' }]}>
                          <Text style={s.recomMeta}>
                            Stock actual: <Text style={{ color: accentColor, fontWeight: '600' }}>{item.qty} {item.unit}</Text>
                          </Text>
                          {faltante > 0 && (
                            <Text style={[s.recomSugerido, { color: accentColor }]}>
                              Pedir ≥ {faltante.toFixed(1)} {item.unit}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Modal formulario nuevo proveedor ────────────────────────────────────────
function ModalNuevoProveedor({ visible, onClose, onGuardar }) {
  const FORM_INIT = { nombre: '', empresa: '', telefono: '', dias: [], locales: [] };
  const [form, setForm] = useState(FORM_INIT);
  const [errors, setErrors] = useState({});

  function toggleDia(idx) {
    setForm(f => ({
      ...f,
      dias: f.dias.includes(idx) ? f.dias.filter(d => d !== idx) : [...f.dias, idx],
    }));
  }

  function toggleLocal(local) {
    setForm(f => ({
      ...f,
      locales: f.locales.includes(local) ? f.locales.filter(l => l !== local) : [...f.locales, local],
    }));
  }

  function validate() {
    const e = {};
    if (!form.nombre.trim())   e.nombre   = 'El nombre es obligatorio';
    if (!form.empresa.trim())  e.empresa  = 'La empresa es obligatoria';
    if (!form.telefono.trim()) e.telefono = 'El teléfono es obligatorio';
    if (form.dias.length === 0)    e.dias    = 'Selecciona al menos un día';
    if (form.locales.length === 0) e.locales = 'Selecciona al menos un local';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleGuardar() {
    if (!validate()) return;
    const initials = getInitials(form.nombre);
    onGuardar({ ...form, id: `p${Date.now()}`, initials, tipo: form.empresa });
    setForm(FORM_INIT);
    setErrors({});
    onClose();
  }

  function handleClose() {
    setForm(FORM_INIT);
    setErrors({});
    onClose();
  }

  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={s.modalOverlay} onPress={handleClose}>
        <Pressable style={[s.modalSheet, { maxHeight: '90%' }]} onPress={() => {}}>
          <View style={s.handle} />
          <View style={[s.row, { justifyContent: 'space-between', marginBottom: 18 }]}>
            <Text style={s.modalTitle}>Nuevo recordatorio</Text>
            <Pressable onPress={handleClose}><Text style={s.closeBtn}>✕</Text></Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Nombre */}
            <View style={s.formGroup}>
              <Text style={s.formLabel}>Nombre del contacto <Text style={{ color: '#E24B4A' }}>*</Text></Text>
              <TextInput
                style={[s.input, errors.nombre && s.inputError]}
                placeholder="Ej: Juan Pérez"
                placeholderTextColor="#BDC3C7"
                value={form.nombre}
                onChangeText={v => setForm(f => ({ ...f, nombre: v }))}
              />
              {errors.nombre && <Text style={s.errorText}>{errors.nombre}</Text>}
            </View>

            {/* Empresa */}
            <View style={s.formGroup}>
              <Text style={s.formLabel}>Empresa <Text style={{ color: '#E24B4A' }}>*</Text></Text>
              <TextInput
                style={[s.input, errors.empresa && s.inputError]}
                placeholder="Ej: Distribuidora Central SpA"
                placeholderTextColor="#BDC3C7"
                value={form.empresa}
                onChangeText={v => setForm(f => ({ ...f, empresa: v }))}
              />
              {errors.empresa && <Text style={s.errorText}>{errors.empresa}</Text>}
            </View>

            {/* Teléfono */}
            <View style={s.formGroup}>
              <Text style={s.formLabel}>Teléfono <Text style={{ color: '#E24B4A' }}>*</Text></Text>
              <TextInput
                style={[s.input, errors.telefono && s.inputError]}
                placeholder="+56 9 1234 5678"
                placeholderTextColor="#BDC3C7"
                value={form.telefono}
                onChangeText={v => setForm(f => ({ ...f, telefono: v }))}
                keyboardType="phone-pad"
              />
              {errors.telefono && <Text style={s.errorText}>{errors.telefono}</Text>}
            </View>

            {/* Días de visita */}
            <View style={s.formGroup}>
              <Text style={s.formLabel}>Días de visita <Text style={{ color: '#E24B4A' }}>*</Text></Text>
              <View style={[s.row, { flexWrap: 'wrap', gap: 7 }]}>
                {DIAS_SEMANA.map(({ idx, label }) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => toggleDia(idx)}
                    style={[
                      s.diaToggle,
                      form.dias.includes(idx) && s.diaToggleActive,
                    ]}
                  >
                    <Text style={[
                      s.diaToggleText,
                      form.dias.includes(idx) && s.diaToggleTextActive,
                    ]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.dias && <Text style={s.errorText}>{errors.dias}</Text>}
            </View>

            {/* Locales */}
            <View style={s.formGroup}>
              <Text style={s.formLabel}>Locales que abastece <Text style={{ color: '#E24B4A' }}>*</Text></Text>
              <View style={[s.row, { flexWrap: 'wrap', gap: 7 }]}>
                {LOCALES_LIST.map(local => {
                  const col = LOCAL_COLORS[local];
                  const selected = form.locales.includes(local);
                  return (
                    <TouchableOpacity
                      key={local}
                      onPress={() => toggleLocal(local)}
                      style={[
                        s.localToggle,
                        selected && { backgroundColor: col.bg, borderColor: col.text },
                      ]}
                    >
                      <Text style={[
                        s.localToggleText,
                        selected && { color: col.text, fontWeight: '600' },
                      ]}>
                        {LOCAL_LABELS[local]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.locales && <Text style={s.errorText}>{errors.locales}</Text>}
            </View>

            {/* Botones */}
            <View style={[s.row, { gap: 10, marginTop: 6, marginBottom: 8 }]}>
              <TouchableOpacity onPress={handleClose} style={[s.btn, s.btnSecondary]}>
                <Text style={s.btnSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleGuardar} style={[s.btn, s.btnPrimary]}>
                <Text style={s.btnPrimaryText}>Guardar recordatorio</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Sección por local (genérica) ─────────────────────────────────────────────
function SeccionPorLocal({ titulo, items, localKey, renderCard, emptyText }) {
  if (items.length === 0) return null;
  const col = LOCAL_COLORS[localKey];
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={[s.row, { marginBottom: 8, gap: 8, alignItems: 'center' }]}>
        <View style={[s.localHeaderDot, { backgroundColor: col?.text || '#7F8C8D' }]} />
        <Text style={s.localHeaderText}>{LOCAL_LABELS[localKey]}</Text>
        <View style={[s.localHeaderBadgeWrap, { backgroundColor: col?.bg || '#F8F9FA' }]}>
          <Text style={[s.localHeaderBadgeText, { color: col?.text || '#7F8C8D' }]}>{items.length}</Text>
        </View>
      </View>
      <View style={s.list}>
        {items.map(item => renderCard(item))}
      </View>
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function AlertasScreen() {
  const { colors } = useTheme();
  const [activeTab,        setActiveTab]        = useState('stock');
  const [activeLocal,      setActiveLocal]      = useState('todos');
  const [modalStock,       setModalStock]       = useState(null);
  const [modalVenc,        setModalVenc]        = useState(null);
  const [modalProv,        setModalProv]        = useState(null);
  const [modalNuevoProv,   setModalNuevoProv]   = useState(false);
  const [proveedores,      setProveedores]      = useState(PROVEEDORES_INIT);
  const [activeProvLocal,  setActiveProvLocal]  = useState('todos');

  // ── Filtrado stock ──
  const stockFiltrado = activeLocal === 'todos'
    ? STOCK_DATA
    : STOCK_DATA.filter(i => i.local === activeLocal);
  const criticos = stockFiltrado.filter(i => ['critical', 'out'].includes(getLevel(i)));
  const bajos    = stockFiltrado.filter(i => getLevel(i) === 'low');

  // ── Filtrado vencimientos ──
  const vencFiltrado = activeLocal === 'todos'
    ? VENCIMIENTOS_DATA
    : VENCIMIENTOS_DATA.filter(i => i.local === activeLocal);
  const vencUrgentes = vencFiltrado.filter(i => getVencLevel(i.vence) === 'critical');
  const vencProximos = vencFiltrado.filter(i => getVencLevel(i.vence) === 'warning');
  const vencAvisos   = vencFiltrado.filter(i => getVencLevel(i.vence) === 'soon');

  // ── Contadores globales ──
  const cntCritico  = STOCK_DATA.filter(i => ['critical', 'out'].includes(getLevel(i))).length;
  const cntBajo     = STOCK_DATA.filter(i => getLevel(i) === 'low').length;
  const cntVenc     = VENCIMIENTOS_DATA.filter(i => getVencLevel(i.vence) !== 'soon').length;
  const cntHoy      = proveedores.filter(p => p.dias.includes(HOY_IDX)).length;

  const provOrdenados = [...proveedores]
    .filter(p => activeProvLocal === 'todos' || p.locales.includes(activeProvLocal))
    .sort((a, b) => b.dias.includes(HOY_IDX) - a.dias.includes(HOY_IDX));

  function handleGuardarProveedor(nuevo) {
    setProveedores(prev => [...prev, nuevo]);
  }

  const TABS = [
    { id: 'stock',       label: 'Stock' },
    { id: 'vencimientos',label: 'Vencimientos' },
    { id: 'proveedores', label: 'Proveedores' },
  ];

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
          { label: 'Por vencer',       value: cntVenc,    color: '#BA7517' },
          { label: 'Proveedores hoy',  value: cntHoy || proveedores.length, color: '#639922' },
        ].map((m, i) => (
          <View key={i} style={[s.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.metricLabel, { color: colors.textSecondary }]}>{m.label}</Text>
            <Text style={[s.metricValue, { color: m.color }]}>{m.value}</Text>
          </View>
        ))}
      </View>

      {/* ── Tabs ── */}
      <View style={[s.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[s.tab, activeTab === tab.id && s.tabActive]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[
              s.tabText,
              { color: activeTab === tab.id ? colors.textPrimary : colors.textSecondary },
              activeTab === tab.id && { fontWeight: '600' },
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Contenido ── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ══ STOCK ══ */}
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

            {activeLocal === 'todos' ? (
              // Vista agrupada por local
              LOCALES_LIST.map(local => {
                const itemsLocal = STOCK_DATA.filter(i =>
                  i.local === local && ['critical', 'out', 'low'].includes(getLevel(i))
                );
                if (itemsLocal.length === 0) return null;
                return (
                  <SeccionPorLocal
                    key={local}
                    localKey={local}
                    items={itemsLocal}
                    renderCard={item => <StockAlertCard key={item.id} item={item} onVerDetalle={setModalStock} />}
                  />
                );
              })
            ) : (
              // Vista filtrada por local específico
              <>
                <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>
                  CRÍTICO · {criticos.length} PRODUCTO{criticos.length !== 1 ? 'S' : ''}
                </Text>
                <View style={[s.list, { marginBottom: 18 }]}>
                  {criticos.length === 0
                    ? <View style={[s.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Sin alertas críticas para este local</Text>
                      </View>
                    : criticos.map(item => <StockAlertCard key={item.id} item={item} onVerDetalle={setModalStock} />)
                  }
                </View>
                <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>
                  STOCK BAJO · {bajos.length} PRODUCTO{bajos.length !== 1 ? 'S' : ''}
                </Text>
                <View style={s.list}>
                  {bajos.length === 0
                    ? <View style={[s.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Sin stock bajo para este local</Text>
                      </View>
                    : bajos.map(item => <StockAlertCard key={item.id} item={item} onVerDetalle={setModalStock} />)
                  }
                </View>
              </>
            )}
          </View>
        )}

        {/* ══ VENCIMIENTOS ══ */}
        {activeTab === 'vencimientos' && (
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

            {activeLocal === 'todos' ? (
              // Vista agrupada por local
              LOCALES_LIST.map(local => {
                const itemsLocal = VENCIMIENTOS_DATA.filter(i => i.local === local);
                if (itemsLocal.length === 0) return null;
                return (
                  <SeccionPorLocal
                    key={local}
                    localKey={local}
                    items={itemsLocal}
                    renderCard={item => <VencimientoCard key={item.id} item={item} onVerDetalle={setModalVenc} />}
                  />
                );
              })
            ) : (
              // Vista filtrada por local específico
              <>
                {vencUrgentes.length > 0 && (
                  <>
                    <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>
                      URGENTE · {vencUrgentes.length} PRODUCTO{vencUrgentes.length !== 1 ? 'S' : ''}
                    </Text>
                    <View style={[s.list, { marginBottom: 18 }]}>
                      {vencUrgentes.map(item => <VencimientoCard key={item.id} item={item} onVerDetalle={setModalVenc} />)}
                    </View>
                  </>
                )}
                {vencProximos.length > 0 && (
                  <>
                    <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>
                      PRÓXIMOS (≤3 DÍAS) · {vencProximos.length} PRODUCTO{vencProximos.length !== 1 ? 'S' : ''}
                    </Text>
                    <View style={[s.list, { marginBottom: 18 }]}>
                      {vencProximos.map(item => <VencimientoCard key={item.id} item={item} onVerDetalle={setModalVenc} />)}
                    </View>
                  </>
                )}
                {vencAvisos.length > 0 && (
                  <>
                    <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>
                      EN LOS PRÓXIMOS 7 DÍAS · {vencAvisos.length} PRODUCTO{vencAvisos.length !== 1 ? 'S' : ''}
                    </Text>
                    <View style={s.list}>
                      {vencAvisos.map(item => <VencimientoCard key={item.id} item={item} onVerDetalle={setModalVenc} />)}
                    </View>
                  </>
                )}
                {vencFiltrado.length === 0 && (
                  <View style={[s.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Sin productos por vencer en este local</Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* ══ PROVEEDORES ══ */}
        {activeTab === 'proveedores' && (
          <View>
            {/* Botón agregar */}
            <TouchableOpacity
              onPress={() => setModalNuevoProv(true)}
              style={s.addProvBtn}
              activeOpacity={0.8}
            >
              <Text style={s.addProvBtnText}>＋  Nuevo recordatorio</Text>
            </TouchableOpacity>

            {/* Filtro por local */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <View style={s.filtroRow}>
                {LOCALES_FILTRO.map(loc => (
                  <TouchableOpacity
                    key={loc.id}
                    onPress={() => setActiveProvLocal(loc.id)}
                    style={[
                      s.filtroBtn,
                      { borderColor: activeProvLocal === loc.id ? colors.textPrimary : colors.border },
                      activeProvLocal === loc.id && { backgroundColor: colors.btnBg },
                    ]}
                    activeOpacity={0.75}
                  >
                    <Text style={[
                      s.filtroBtnText,
                      { color: activeProvLocal === loc.id ? colors.btnText : colors.textSecondary },
                      activeProvLocal === loc.id && { fontWeight: '600' },
                    ]}>
                      {loc.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Lista: agrupada por local en "Todos", o plana si hay filtro */}
            {activeProvLocal === 'todos' ? (
              LOCALES_LIST.map(local => {
                const itemsLocal = provOrdenados.filter(p => p.locales.includes(local));
                if (itemsLocal.length === 0) return null;
                return (
                  <SeccionPorLocal
                    key={local}
                    localKey={local}
                    items={itemsLocal}
                    renderCard={p => <ProveedorCard key={p.id} proveedor={p} onVerDetalle={setModalProv} />}
                  />
                );
              })
            ) : (
              <>
                {provOrdenados.length === 0 ? (
                  <View style={[s.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Sin proveedores para este local</Text>
                  </View>
                ) : (
                  <View style={s.list}>
                    {provOrdenados.map(p => (
                      <ProveedorCard key={p.id} proveedor={p} onVerDetalle={setModalProv} />
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}

      </ScrollView>

      {/* ── Modales ── */}
      <ModalDetalleStock       item={modalStock}        onClose={() => setModalStock(null)} />
      <ModalDetalleVencimiento item={modalVenc}         onClose={() => setModalVenc(null)} />
      <ModalDetalleProveedor   proveedor={modalProv}    onClose={() => setModalProv(null)} />
      <ModalNuevoProveedor
        visible={modalNuevoProv}
        onClose={() => setModalNuevoProv(false)}
        onGuardar={handleGuardarProveedor}
      />
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
  tabText:         { fontSize: 13 },

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

  // Encabezado por local
  localHeaderDot:      { width: 8, height: 8, borderRadius: 4 },
  localHeaderText:     { fontSize: 13, fontWeight: '700', color: '#2C3E50', flex: 1 },
  localHeaderBadgeWrap:{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  localHeaderBadgeText:{ fontSize: 12, fontWeight: '600' },

  // Alerta de stock / vencimiento
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

  // Botón agregar proveedor
  addProvBtn:      { backgroundColor: '#2C3E50', borderRadius: 10, padding: 13, alignItems: 'center', marginBottom: 18 },
  addProvBtnText:  { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

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

  // Formulario
  formGroup:       { marginBottom: 16 },
  formLabel:       { fontSize: 13, fontWeight: '600', color: '#2C3E50', marginBottom: 7 },
  input:           { borderWidth: 1, borderColor: '#E2E6EA', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11, fontSize: 14, color: '#2C3E50', backgroundColor: '#FAFBFC' },
  inputError:      { borderColor: '#E24B4A' },
  errorText:       { fontSize: 12, color: '#E24B4A', marginTop: 4 },

  // Días toggle
  diaToggle:       { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E2E6EA', backgroundColor: '#FAFBFC' },
  diaToggleActive: { backgroundColor: '#2C3E50', borderColor: '#2C3E50' },
  diaToggleText:   { fontSize: 12, color: '#7F8C8D', fontWeight: '500' },
  diaToggleTextActive: { color: '#FFFFFF', fontWeight: '600' },

  // Local toggle (formulario)
  localToggle:     { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E2E6EA', backgroundColor: '#FAFBFC' },
  localToggleText: { fontSize: 12, color: '#7F8C8D', fontWeight: '500' },

  // Botones formulario
  btn:             { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  btnPrimary:      { backgroundColor: '#2C3E50' },
  btnPrimaryText:  { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  btnSecondary:    { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E2E6EA' },
  btnSecondaryText:{ color: '#7F8C8D', fontSize: 14, fontWeight: '500' },

  // Recomendación de compra (modal proveedor)
  recomCard:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: '#E2E6EA', borderLeftWidth: 3, borderTopRightRadius: 10, borderBottomRightRadius: 10, padding: 11 },
  recomIcon:       { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  recomNombre:     { fontSize: 13, fontWeight: '600', color: '#2C3E50', flex: 1, marginRight: 6 },
  recomMeta:       { fontSize: 12, color: '#7F8C8D' },
  recomSugerido:   { fontSize: 12, fontWeight: '700' },
  recomEmptyBox:   { borderWidth: 0.5, borderColor: '#E2E6EA', borderRadius: 10, padding: 18, alignItems: 'center', backgroundColor: '#F8F9FA', marginBottom: 8 },
  recomEmptyText:  { fontSize: 13, color: '#7F8C8D', textAlign: 'center' },
});