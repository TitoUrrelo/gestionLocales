import { useState, useEffect } from "react";

// ─── Paleta de colores (inspirada en el ThemeContext del proyecto) ─────────────
const C = {
  bg: "#F4F6F7",
  surface: "#FFFFFF",
  surface2: "#F8F9FA",
  border: "#E2E6EA",
  textPrimary: "#2C3E50",
  textSecondary: "#7F8C8D",
  placeholder: "#BDC3C7",
  btnBg: "#2C3E50",
  btnText: "#FFFFFF",
  danger: { bg: "#FCEBEB", text: "#791F1F", border: "#F09595", accent: "#E24B4A" },
  warning: { bg: "#FAEEDA", text: "#633806", border: "#FAC775", accent: "#BA7517" },
  success: { bg: "#EAF3DE", text: "#27500A", border: "#C0DD97", accent: "#639922" },
  info: { bg: "#E6F1FB", text: "#0C447C", border: "#B5D4F4", accent: "#2E86DE" },
};

// ─── Datos de ejemplo ─────────────────────────────────────────────────────────
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const HOY_IDX = new Date().getDay();

const STOCK_DATA = [
  { id: "1", nombre: "Pollo (kg)", local: "comida", qty: 0.5, min: 5, max: 20, unit: "kg" },
  { id: "2", nombre: "Pan de completo", local: "comida", qty: 8, min: 30, max: 100, unit: "un" },
  { id: "3", nombre: "Carne molida (kg)", local: "comida", qty: 1.2, min: 4, max: 15, unit: "kg" },
  { id: "4", nombre: "Aceite (lt)", local: "cafeteria", qty: 0.3, min: 2, max: 8, unit: "lt" },
  { id: "5", nombre: "Harina (kg)", local: "cafeteria", qty: 3.5, min: 5, max: 25, unit: "kg" },
  { id: "6", nombre: "Café (kg)", local: "cafeteria", qty: 0.4, min: 1.5, max: 5, unit: "kg" },
  { id: "7", nombre: "Azúcar (kg)", local: "almacen", qty: 2.1, min: 3, max: 20, unit: "kg" },
  { id: "8", nombre: "Arroz (kg)", local: "almacen", qty: 12, min: 5, max: 30, unit: "kg" },
  { id: "9", nombre: "Tomate (kg)", local: "almacen", qty: 4.8, min: 3, max: 15, unit: "kg" },
];

const PROVEEDORES = [
  {
    id: "p1", nombre: "Distribuidora El Pollo", initials: "DP",
    tipo: "Carnes y aves", locales: ["comida"],
    dias: [1, 4], contacto: "Juan Pérez", telefono: "+56 9 1234 5678",
  },
  {
    id: "p2", nombre: "Panificadora Central", initials: "PC",
    tipo: "Pan y masas", locales: ["comida", "cafeteria"],
    dias: [2, 5], contacto: "María López", telefono: "+56 9 8765 4321",
  },
  {
    id: "p3", nombre: "Almacén Santiago SpA", initials: "AS",
    tipo: "Abarrotes generales", locales: ["almacen", "cafeteria"],
    dias: [1, 3, 5], contacto: "Carlos Ruiz", telefono: "+56 9 5555 1234",
  },
  {
    id: "p4", nombre: "Café & Co.", initials: "CC",
    tipo: "Insumos cafetería", locales: ["cafeteria"],
    dias: [3], contacto: "Ana Soto", telefono: "+56 9 9999 8888",
  },
];

const LOCAL_LABELS = { comida: "Comida Rápida", almacen: "Almacén", cafeteria: "Cafetería" };
const LOCAL_COLORS = {
  comida:   { bg: "#E6F1FB", text: "#0C447C" },
  almacen:  { bg: "#EAF3DE", text: "#27500A" },
  cafeteria:{ bg: "#FAEEDA", text: "#633806" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getLevel(item) {
  const pct = item.qty / item.min;
  if (pct <= 0) return "out";
  if (pct <= 0.3) return "critical";
  if (pct <= 1) return "low";
  return "ok";
}

function getPct(item) {
  return Math.min(100, Math.round((item.qty / item.max) * 100));
}

// ─── Componentes pequeños ─────────────────────────────────────────────────────

function Badge({ label, level }) {
  const map = {
    critical: { bg: C.danger.bg, text: C.danger.text },
    out:      { bg: C.danger.bg, text: C.danger.text },
    low:      { bg: C.warning.bg, text: C.warning.text },
    ok:       { bg: C.success.bg, text: C.success.text },
    info:     { bg: C.info.bg, text: C.info.text },
  };
  const col = map[level] || map.ok;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 8px",
      borderRadius: 6, background: col.bg, color: col.text,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

function StockBar({ pct, level }) {
  const color = level === "ok" ? C.success.accent : level === "low" ? C.warning.accent : C.danger.accent;
  return (
    <div style={{ width: 72 }}>
      <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width .3s" }} />
      </div>
      <div style={{ fontSize: 11, color: C.textSecondary, textAlign: "right", marginTop: 2 }}>{pct}%</div>
    </div>
  );
}

function LocalChip({ local }) {
  const col = LOCAL_COLORS[local] || { bg: C.surface2, text: C.textSecondary };
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: 5,
      background: col.bg, color: col.text,
    }}>
      {LOCAL_LABELS[local] || local}
    </span>
  );
}

// ─── Tarjeta de alerta de stock ───────────────────────────────────────────────

function StockAlertCard({ item, onVerDetalle }) {
  const level = getLevel(item);
  const pct = getPct(item);
  const accentColor = level === "ok"
    ? C.success.accent
    : ["critical", "out"].includes(level) ? C.danger.accent : C.warning.accent;

  const badgeLabel = level === "out" ? "Sin stock" : level === "critical" ? "Crítico" : "Stock bajo";

  return (
    <div
      onClick={() => onVerDetalle(item)}
      style={{
        background: C.surface,
        border: `0.5px solid ${C.border}`,
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: "0 12px 12px 0",
        padding: "12px 14px",
        display: "flex", alignItems: "center", gap: 12,
        cursor: "pointer", transition: "background .15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = C.surface2}
      onMouseLeave={e => e.currentTarget.style.background = C.surface}
    >
      {/* Ícono */}
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: ["critical","out"].includes(level) ? C.danger.bg : C.warning.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, flexShrink: 0,
      }}>
        {["critical","out"].includes(level) ? "⚠" : "↓"}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary }}>{item.nombre}</div>
        <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>
          Actual: <strong style={{ color: C.textPrimary }}>{item.qty} {item.unit}</strong>
          {" · "}Mínimo: {item.min} {item.unit}
        </div>
        <div style={{ marginTop: 5 }}>
          <LocalChip local={item.local} />
        </div>
      </div>

      {/* Barra + badge */}
      <StockBar pct={pct} level={level} />
      <Badge label={badgeLabel} level={level} />
    </div>
  );
}

// ─── Tarjeta proveedor ────────────────────────────────────────────────────────

function ProveedorCard({ proveedor, onVerDetalle }) {
  const visitaHoy = proveedor.dias.includes(HOY_IDX);
  return (
    <div
      onClick={() => onVerDetalle(proveedor)}
      style={{
        background: C.surface,
        border: `0.5px solid ${C.border}`,
        borderLeft: visitaHoy ? `3px solid ${C.warning.accent}` : `0.5px solid ${C.border}`,
        borderRadius: visitaHoy ? "0 12px 12px 0" : 12,
        padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 14,
        cursor: "pointer", transition: "background .15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = C.surface2}
      onMouseLeave={e => e.currentTarget.style.background = C.surface}
    >
      {/* Avatar */}
      <div style={{
        width: 42, height: 42, borderRadius: "50%",
        background: C.info.bg, color: C.info.text,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 600, flexShrink: 0,
      }}>
        {proveedor.initials}
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary }}>{proveedor.nombre}</span>
          {visitaHoy && <Badge label="Visita hoy" level="low" />}
        </div>
        <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{proveedor.tipo}</div>
        {/* Chips de locales */}
        <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
          {proveedor.locales.map(l => <LocalChip key={l} local={l} />)}
        </div>
        {/* Días */}
        <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
          {proveedor.dias.map(d => (
            <span key={d} style={{
              fontSize: 11, padding: "2px 7px", borderRadius: 5, fontWeight: 500,
              background: d === HOY_IDX ? C.warning.bg : C.surface2,
              color: d === HOY_IDX ? C.warning.text : C.textSecondary,
              border: `0.5px solid ${d === HOY_IDX ? C.warning.border : C.border}`,
            }}>
              {DIAS[d]}{d === HOY_IDX ? " · Hoy" : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Modal de detalle stock ───────────────────────────────────────────────────

function ModalDetalleStock({ item, onClose }) {
  if (!item) return null;
  const level = getLevel(item);
  const pct = getPct(item);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 1000, padding: "0 0 0 0",
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, borderRadius: "20px 20px 0 0",
          width: "100%", maxWidth: 560, padding: "20px 20px 32px",
          maxHeight: "80vh", overflowY: "auto",
        }}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: C.border, borderRadius: 2, margin: "0 auto 16px" }} />

        {/* Encabezado */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, color: C.textPrimary }}>{item.nombre}</div>
            <div style={{ marginTop: 4 }}><LocalChip local={item.local} /></div>
          </div>
          <button onClick={onClose} style={{
            border: "none", background: "none", fontSize: 20,
            color: C.textSecondary, cursor: "pointer", padding: "0 4px",
          }}>✕</button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Stock actual", value: `${item.qty} ${item.unit}` },
            { label: "Stock mínimo", value: `${item.min} ${item.unit}` },
            { label: "Porcentaje", value: `${pct}%` },
          ].map((s, i) => (
            <div key={i} style={{ background: C.surface2, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Barra grande */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 12, color: C.textSecondary }}>Nivel de stock</span>
            <Badge
              label={level === "out" ? "Sin stock" : level === "critical" ? "Crítico" : level === "low" ? "Stock bajo" : "Normal"}
              level={level === "out" || level === "critical" ? "critical" : level === "low" ? "low" : "ok"}
            />
          </div>
          <div style={{ height: 10, background: C.border, borderRadius: 5, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${pct}%`, borderRadius: 5,
              background: ["critical","out"].includes(level) ? C.danger.accent : level === "low" ? C.warning.accent : C.success.accent,
              transition: "width .4s",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 11, color: C.textSecondary }}>0 {item.unit}</span>
            <span style={{ fontSize: 11, color: C.textSecondary }}>{item.max} {item.unit}</span>
          </div>
        </div>

        {/* Recomendación */}
        <div style={{
          background: C.info.bg, border: `0.5px solid ${C.info.border}`,
          borderRadius: 10, padding: "10px 14px",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.info.text, marginBottom: 3 }}>Recomendación</div>
          <div style={{ fontSize: 13, color: C.info.text }}>
            {["critical","out"].includes(level)
              ? `Solicitar reposición urgente. Faltan ${(item.min - item.qty).toFixed(1)} ${item.unit} para alcanzar el mínimo.`
              : `Considerar pedido pronto. Stock actual es ${Math.round(pct)}% del máximo.`}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal detalle proveedor ──────────────────────────────────────────────────

function ModalDetalleProveedor({ proveedor, onClose }) {
  if (!proveedor) return null;
  const visitaHoy = proveedor.dias.includes(HOY_IDX);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 1000,
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, borderRadius: "20px 20px 0 0",
          width: "100%", maxWidth: 560, padding: "20px 20px 32px",
        }}
      >
        <div style={{ width: 36, height: 4, background: C.border, borderRadius: 2, margin: "0 auto 16px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%", background: C.info.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 700, color: C.info.text,
            }}>
              {proveedor.initials}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary }}>{proveedor.nombre}</div>
              <div style={{ fontSize: 13, color: C.textSecondary }}>{proveedor.tipo}</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            border: "none", background: "none", fontSize: 20,
            color: C.textSecondary, cursor: "pointer", padding: "0 4px",
          }}>✕</button>
        </div>

        {/* Info rows */}
        <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
          {[
            { k: "Contacto", v: proveedor.contacto },
            { k: "Teléfono", v: proveedor.telefono },
            { k: "Días de visita", v: proveedor.dias.map(d => DIAS[d]).join(" · ") },
          ].map((row, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 14px",
              borderBottom: i < 2 ? `0.5px solid ${C.border}` : "none",
            }}>
              <span style={{ fontSize: 13, color: C.textSecondary }}>{row.k}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>{row.v}</span>
            </div>
          ))}
        </div>

        {/* Locales */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: C.textSecondary, fontWeight: 600, marginBottom: 7, textTransform: "uppercase", letterSpacing: ".05em" }}>Locales abastecidos</div>
          <div style={{ display: "flex", gap: 6 }}>
            {proveedor.locales.map(l => <LocalChip key={l} local={l} />)}
          </div>
        </div>

        {/* Aviso si visita hoy */}
        {visitaHoy && (
          <div style={{
            background: C.warning.bg, border: `0.5px solid ${C.warning.border}`,
            borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10, alignItems: "center",
          }}>
            <span style={{ fontSize: 18 }}>📋</span>
            <span style={{ fontSize: 13, color: C.warning.text, fontWeight: 500 }}>
              Este proveedor visita hoy. Recuerda preparar el pedido.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AlertasScreen() {
  const [activeTab, setActiveTab] = useState("stock");
  const [activeLocal, setActiveLocal] = useState("todos");
  const [modalStock, setModalStock] = useState(null);
  const [modalProv, setModalProv] = useState(null);

  // Filtrado de stock
  const stockFiltrado = activeLocal === "todos"
    ? STOCK_DATA
    : STOCK_DATA.filter(i => i.local === activeLocal);

  const criticos = stockFiltrado.filter(i => ["critical","out"].includes(getLevel(i)));
  const bajos    = stockFiltrado.filter(i => getLevel(i) === "low");

  // Contadores globales (sin filtro)
  const cntCritico = STOCK_DATA.filter(i => ["critical","out"].includes(getLevel(i))).length;
  const cntBajo    = STOCK_DATA.filter(i => getLevel(i) === "low").length;
  const cntHoy     = PROVEEDORES.filter(p => p.dias.includes(HOY_IDX)).length;

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
    }}>

      {/* ── Header ── */}
      <div style={{
        background: C.surface, borderBottom: `0.5px solid ${C.border}`,
        padding: "14px 16px",
      }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.textPrimary }}>Alertas del sistema</div>
        <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 2 }}>
          Inventario y proveedores · 3 locales
        </div>
      </div>

      {/* ── Métricas resumen ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "14px 14px 0" }}>
        {[
          { label: "Stock crítico", value: cntCritico, level: "danger" },
          { label: "Stock bajo",    value: cntBajo,    level: "warning" },
          { label: "Proveedores hoy", value: cntHoy || PROVEEDORES.length, level: "success" },
        ].map((m, i) => (
          <div key={i} style={{
            background: C.surface, border: `0.5px solid ${C.border}`,
            borderRadius: 12, padding: "12px 14px",
          }}>
            <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 5 }}>{m.label}</div>
            <div style={{
              fontSize: 26, fontWeight: 700,
              color: m.level === "danger" ? C.danger.accent : m.level === "warning" ? C.warning.accent : C.success.accent,
            }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: "flex", borderBottom: `0.5px solid ${C.border}`,
        background: C.surface, marginTop: 14,
      }}>
        {[
          { id: "stock", label: "Stock" },
          { id: "proveedores", label: "Proveedores" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: "12px 0", border: "none", background: "none", cursor: "pointer",
              fontSize: 14, fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? C.textPrimary : C.textSecondary,
              borderBottom: activeTab === tab.id ? `2px solid ${C.textPrimary}` : "2px solid transparent",
              transition: "all .15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Contenido ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>

        {/* STOCK */}
        {activeTab === "stock" && (
          <div>
            {/* Filtro por local */}
            <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" }}>
              {[
                { id: "todos", label: "Todos" },
                { id: "comida", label: "Comida Rápida" },
                { id: "almacen", label: "Almacén" },
                { id: "cafeteria", label: "Cafetería" },
              ].map(loc => (
                <button
                  key={loc.id}
                  onClick={() => setActiveLocal(loc.id)}
                  style={{
                    padding: "5px 13px", borderRadius: 100, fontSize: 12, cursor: "pointer",
                    border: `0.5px solid ${activeLocal === loc.id ? C.textPrimary : C.border}`,
                    background: activeLocal === loc.id ? C.textPrimary : "transparent",
                    color: activeLocal === loc.id ? "#fff" : C.textSecondary,
                    fontWeight: activeLocal === loc.id ? 600 : 400,
                    transition: "all .15s",
                  }}
                >
                  {loc.label}
                </button>
              ))}
            </div>

            {/* Crítico */}
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
              Crítico · {criticos.length} producto{criticos.length !== 1 ? "s" : ""}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              {criticos.length === 0
                ? <div style={{ textAlign: "center", padding: "1.5rem", color: C.textSecondary, fontSize: 13, background: C.surface, borderRadius: 12, border: `0.5px solid ${C.border}` }}>Sin alertas críticas para este local</div>
                : criticos.map(item => <StockAlertCard key={item.id} item={item} onVerDetalle={setModalStock} />)
              }
            </div>

            {/* Bajo */}
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
              Stock bajo · {bajos.length} producto{bajos.length !== 1 ? "s" : ""}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {bajos.length === 0
                ? <div style={{ textAlign: "center", padding: "1.5rem", color: C.textSecondary, fontSize: 13, background: C.surface, borderRadius: 12, border: `0.5px solid ${C.border}` }}>Sin stock bajo para este local</div>
                : bajos.map(item => <StockAlertCard key={item.id} item={item} onVerDetalle={setModalStock} />)
              }
            </div>
          </div>
        )}

        {/* PROVEEDORES */}
        {activeTab === "proveedores" && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
              Recordatorios de visita · {PROVEEDORES.length} proveedores
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PROVEEDORES
                .slice()
                .sort((a, b) => b.dias.includes(HOY_IDX) - a.dias.includes(HOY_IDX))
                .map(p => <ProveedorCard key={p.id} proveedor={p} onVerDetalle={setModalProv} />)
              }
            </div>
          </div>
        )}
      </div>

      {/* ── Modales ── */}
      {modalStock && <ModalDetalleStock item={modalStock} onClose={() => setModalStock(null)} />}
      {modalProv  && <ModalDetalleProveedor proveedor={modalProv} onClose={() => setModalProv(null)} />}
    </div>
  );
}
