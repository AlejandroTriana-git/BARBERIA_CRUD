import React, { useState, useEffect } from "react";
import apiClient from "../services/apiClient";
import PerfilUsuario from "../components/PerfilUsuario";

function AdminPage() {
  const [activeTab, setActiveTab] = useState("barberos");

  // Barberos
  const [barberos, setBarberos] = useState([]);
  const [barbaroEditar, setBarberoEditar] = useState(null);
  const [showFormBarbero, setShowFormBarbero] = useState(false);
  const [cargandoBarberos, setCargandoBarberos] = useState(false);
  const [barbaroSeleccionado, setBarberoSeleccionado] = useState(null);

  // Servicios
  const [servicios, setServicios] = useState([]);
  const [servicioEditar, setServicioEditar] = useState(null);
  const [showFormServicio, setShowFormServicio] = useState(false);
  const [cargandoServicios, setCargandoServicios] = useState(false);

  // Clientes
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);

  // Horarios
  const [horariosPorBarbero, setHorariosPorBarbero] = useState({});
  const [showFormHorario, setShowFormHorario] = useState(false);
  const [idBarberoHorario, setIdBarberoHorario] = useState("");

  useEffect(() => {
    // Cargar datos iniciales
    cargarBarberos();
    cargarServicios();

    // Luego cargar según la pestaña
    if (activeTab === "clientes") cargarUsuarios();
  }, [activeTab]);

  const cargarBarberos = async () => {
    try {
      setCargandoBarberos(true);
      const data = await apiClient.get("/barberos");
      setBarberos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar barberos:", err);
    } finally {
      setCargandoBarberos(false);
    }
  };

  const cargarServicios = async () => {
    try {
      setCargandoServicios(true);
      const data = await apiClient.get("/servicios");
      setServicios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar servicios:", err);
    } finally {
      setCargandoServicios(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      setCargandoUsuarios(true);
      const data = await apiClient.get("/usuarios");
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  const cargarHorariosBarbero = async (idBarbero) => {
    try {
      const data = await apiClient.get(`/barberos/${idBarbero}/horarios`);
      setHorariosPorBarbero(prev => ({
        ...prev,
        [idBarbero]: Array.isArray(data) ? data : []
      }));
    } catch (err) {
      console.error("Error al cargar horarios:", err);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Panel de Administración</h1>

      {/* Navegación de pestañas */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", borderBottom: "2px solid #ddd", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("perfil")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "perfil" ? "#667eea" : "#ddd",
            color: activeTab === "perfil" ? "white" : "black",
            border: "none",
            borderRadius: "5px 5px 0 0",
            cursor: "pointer",
            fontWeight: activeTab === "perfil" ? "bold" : "normal",
          }}
        >
          👤 Mi Perfil
        </button>
        <button
          onClick={() => setActiveTab("barberos")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "barberos" ? "#667eea" : "#ddd",
            color: activeTab === "barberos" ? "white" : "black",
            border: "none",
            borderRadius: "5px 5px 0 0",
            cursor: "pointer",
            fontWeight: activeTab === "barberos" ? "bold" : "normal",
          }}
        >
          👨‍💼 Barberos
        </button>
        <button
          onClick={() => setActiveTab("servicios")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "servicios" ? "#667eea" : "#ddd",
            color: activeTab === "servicios" ? "white" : "black",
            border: "none",
            borderRadius: "5px 5px 0 0",
            cursor: "pointer",
            fontWeight: activeTab === "servicios" ? "bold" : "normal",
          }}
        >
          ✂️ Servicios
        </button>
        <button
          onClick={() => setActiveTab("clientes")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "clientes" ? "#667eea" : "#ddd",
            color: activeTab === "clientes" ? "white" : "black",
            border: "none",
            borderRadius: "5px 5px 0 0",
            cursor: "pointer",
            fontWeight: activeTab === "clientes" ? "bold" : "normal",
          }}
        >
          👥 Clientes
        </button>
      </div>

      {/* Contenido por pestaña */}
      <div style={{ background: "white", padding: "20px", borderRadius: "10px", minHeight: "400px" }}>
        {activeTab === "perfil" && <PerfilUsuario />}
        {activeTab === "barberos" && <TabBarberos barbaroEditar={barbaroEditar} barberos={barberos} servicios={servicios} cargando={cargandoBarberos} barbaroSeleccionado={barbaroSeleccionado} setBarberoSeleccionado={setBarberoSeleccionado} setBarberoEditar={setBarberoEditar} setShowFormBarbero={setShowFormBarbero} showFormBarbero={showFormBarbero} onRefresh={cargarBarberos} cargarHorariosBarbero={cargarHorariosBarbero} horariosPorBarbero={horariosPorBarbero} />}
        {activeTab === "servicios" && <TabServicios servicios={servicios} cargando={cargandoServicios} setServicioEditar={setServicioEditar} setShowFormServicio={setShowFormServicio} servicioEditar={servicioEditar} showFormServicio={showFormServicio} onRefresh={cargarServicios} />}
        {activeTab === "clientes" && <TabClientes usuarios={usuarios} cargando={cargandoUsuarios} />}
      </div>
    </div>
  );
}

// Tab Barberos
function TabBarberos({ barbaroEditar, barberos, servicios, cargando, barbaroSeleccionado, setBarberoSeleccionado, setBarberoEditar, setShowFormBarbero, showFormBarbero, onRefresh, cargarHorariosBarbero, horariosPorBarbero }) {
  const [showServicios, setShowServicios] = useState(false);

  if (barbaroSeleccionado) {
    return <VistaBarberoDetalles barbero={barbaroSeleccionado} servicios={servicios} onBack={() => setBarberoSeleccionado(null)} onRefresh={onRefresh} cargarHorariosBarbero={cargarHorariosBarbero} horariosPorBarbero={horariosPorBarbero} />;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Gestión de Barberos</h2>
        <button
          onClick={() => { setBarberoEditar(null); setShowFormBarbero(true); }}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          ➕ Nuevo Barbero
        </button>
      </div>

      {showFormBarbero && <FormBarbero barbaroEditar={barbaroEditar} onClose={() => {setShowFormBarbero(false); onRefresh();}} onSuccess={() => { setShowFormBarbero(false); onRefresh(); setBarberoEditar(null); }} />}

      {cargando ? <p>Cargando barberos...</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>ID</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Nombre</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Teléfono</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Email</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {barberos.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No hay barberos registrados</td></tr>
            ) : (
              barberos.map(barbero => (
                <tr key={barbero.idBarbero}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{barbero.idBarbero}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{barbero.nombreBarbero}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{barbero.telefonoBarbero}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{barbero.correoUsuario}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center", display: "flex", gap: "5px", justifyContent: "center" }}>
                    <button onClick={() => { setBarberoEditar(barbero); setShowFormBarbero(true); }} style={{ backgroundColor: "#FF9800", color: "white", padding: "5px 10px", border: "none", borderRadius: "4px", cursor: "pointer" }}>Editar</button>
                    <button onClick={() => { setBarberoSeleccionado(barbero); cargarHorariosBarbero(barbero.idBarbero); }} style={{ backgroundColor: "#2196F3", color: "white", padding: "5px 10px", border: "none", borderRadius: "4px", cursor: "pointer" }}>Ver</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Vista Barbero Detalles (Servicios + Horarios)
function VistaBarberoDetalles({ barbero, servicios, onBack, onRefresh, cargarHorariosBarbero, horariosPorBarbero }) {
  const [serviciosBarbero, setServiciosBarbero] = useState([]);
  const [showAsignarServicios, setShowAsignarServicios] = useState(false);
  const [showFormHorario, setShowFormHorario] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      await cargarHorariosBarbero(barbero.idBarbero);
      const datos = await apiClient.get(`/barberos/${barbero.idBarbero}/servicios`);
      setServiciosBarbero(Array.isArray(datos) ? datos : []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setCargando(false);
    }
  };

  const horarios = horariosPorBarbero[barbero.idBarbero] || [];

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: "20px", backgroundColor: "#666", color: "white", padding: "8px 16px", border: "none", borderRadius: "5px", cursor: "pointer" }}>← Volver</button>

      <h2>{barbero.nombreBarbero}</h2>

      {/* Servicios Section */}
      <div style={{ marginBottom: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3>Servicios Asignados</h3>
          <button onClick={() => setShowAsignarServicios(true)} style={{ backgroundColor: "#4CAF50", color: "white", padding: "8px 16px", border: "none", borderRadius: "5px", cursor: "pointer" }}>➕ Asignar Servicio</button>
        </div>
        {showAsignarServicios && <FormAsignarServicios idBarbero={barbero.idBarbero} servicios={servicios} serviciosBarbero={serviciosBarbero} onClose={() => setShowAsignarServicios(false)} onSuccess={() => { setShowAsignarServicios(false); cargarDatos(); }} />}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "15px" }}>
          {serviciosBarbero.length === 0 ? (
            <p>No hay servicios asignados</p>
          ) : (
            serviciosBarbero.map(srv => (
              <div key={srv.idServicio} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
                <strong>{srv.nombreServicio}</strong>
                <div style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}>
                  <div>⏱️ {srv.duracion} min</div>
                  <div>💰 ${srv.costo}</div>
                </div>
                <button onClick={() => eliminarServicioBarbero(barbero.idBarbero, srv.idServicio, cargarDatos)} style={{ marginTop: "10px", backgroundColor: "#f44336", color: "white", padding: "5px 10px", border: "none", borderRadius: "4px", cursor: "pointer", width: "100%" }}>Eliminar</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Horarios Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3>Horarios</h3>
          <button onClick={() => setShowFormHorario(true)} style={{ backgroundColor: "#4CAF50", color: "white", padding: "8px 16px", border: "none", borderRadius: "5px", cursor: "pointer" }}>➕ Nuevo Horario</button>
        </div>
        {showFormHorario && <FormHorario idBarbero={barbero.idBarbero} onClose={() => setShowFormHorario(false)} onSuccess={() => { setShowFormHorario(false); cargarHorariosBarbero(barbero.idBarbero); }} />}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Tipo</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Día/Fecha</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Horario</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>Estado</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {horarios.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No hay horarios configurados</td></tr>
            ) : (
              horarios.map(h => (
                <tr key={h.idHorario}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{h.diaSemana ? "Día Semana" : "Fecha Específica"}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{h.diaSemana ? getNombreDia(h.diaSemana) : h.fechaEspecifica}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{h.horaInicio} - {h.horaFin}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}><span style={{ backgroundColor: h.activo ? "#4CAF50" : "#f44336", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>{h.activo ? "Activo" : "Inactivo"}</span></td>
                  <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                    <button onClick={() => eliminarHorario(h.idBarbero_Horario, () => cargarHorariosBarbero(barbero.idBarbero))} style={{ backgroundColor: "#f44336", color: "white", padding: "5px 10px", border: "none", borderRadius: "4px", cursor: "pointer" }}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Formulario Barbero
function FormBarbero({ barbaroEditar, onClose, onSuccess }) {
  const [nombre, setNombre] = useState(barbaroEditar?.nombreBarbero || "");
  const [telefono, setTelefono] = useState(barbaroEditar?.telefonoBarbero || "");
  const [email, setEmail] = useState(barbaroEditar?.correoUsuario || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // useEffect para asegurar pre-llenado
  useEffect(() => {
    if (barbaroEditar) {
      setNombre(barbaroEditar.nombreBarbero || "");
      setTelefono(barbaroEditar.telefonoBarbero || "");
      setEmail(barbaroEditar.correoUsuario || "");
    }
  }, [barbaroEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nombre || !telefono) {
      setError("Nombre y teléfono son requeridos");
      return;
    }

    if (!barbaroEditar && !email) {
      setError("Email es requerido para crear un barbero");
      return;
    }

    try {
      setSaving(true);
      if (barbaroEditar) {
        // Editar: NO enviar email
        await apiClient.put(`/barberos/${barbaroEditar.idBarbero}`, {
          nombreBarbero: nombre,
          telefonoBarbero: telefono
        });
        setSuccess("✅ Barbero actualizado");
        setTimeout(() => { onSuccess(); }, 1000);
      } else {
        // Crear: enviar todo incluyendo email
        const response = await apiClient.post("/barberos", {
          nombreBarbero: nombre,
          telefonoBarbero: telefono,
          correoUsuario: email
        });
        setSuccess(`✅ Barbero creado. Contraseña temporal: ${response.contraseñaTemporal}`);
        
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px", maxWidth: "400px", width: "90%" }}>
        <h3>{barbaroEditar ? "Editar Barbero" : "Nuevo Barbero"}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Nombre:</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Teléfono:</label>
            <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} maxLength="10" style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving} />
          </div>
          {barbaroEditar && (
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Email (no editable):</label>
              <input type="email" value={email} style={{ width: "100%", padding: "8px", fontSize: "14px", backgroundColor: "#f5f5f5" }} disabled={true} />
            </div>
          )}
          {!barbaroEditar && (
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Email:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving} />
            </div>
          )}
          {error && <div style={{ color: "red", marginBottom: "10px", padding: "10px", backgroundColor: "#ffebee", borderRadius: "4px" }}>{error}</div>}
          {success && <div style={{ color: "green", marginBottom: "10px", padding: "10px", backgroundColor: "#e8f5e9", borderRadius: "4px" }}>{success}</div>}
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" disabled={saving} style={{ backgroundColor: "#4CAF50", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" onClick={onClose} style={{ backgroundColor: "#666", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Formulario Asignar Servicios
function FormAsignarServicios({ idBarbero, servicios, serviciosBarbero, onClose, onSuccess }) {
  const [servicioSeleccionado, setServicioSeleccionado] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const serviciosDisponibles = servicios.filter(s => !serviciosBarbero.some(sb => sb.idServicio === s.idServicio));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!servicioSeleccionado) {
      setError("Selecciona un servicio");
      return;
    }

    try {
      setSaving(true);
      await apiClient.post("/barberos/servicios", {
        idBarbero,
        servicios: [parseInt(servicioSeleccionado)]
      });
      alert("✅ Servicio asignado");
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px", maxWidth: "400px", width: "90%" }}>
        <h3>Asignar Servicio</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Servicio:</label>
            <select value={servicioSeleccionado} onChange={(e) => setServicioSeleccionado(e.target.value)} style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving}>
              <option value="">-- Selecciona un servicio --</option>
              {serviciosDisponibles.map(s => <option key={s.idServicio} value={s.idServicio}>{s.nombreServicio} (${s.costo})</option>)}
            </select>
          </div>
          {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" disabled={saving} style={{ backgroundColor: "#4CAF50", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              {saving ? "Asignando..." : "Asignar"}
            </button>
            <button type="button" onClick={onClose} style={{ backgroundColor: "#666", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Formulario Horario
function FormHorario({ idBarbero, onClose, onSuccess }) {
  const [tipo, setTipo] = useState("diaSemana");
  const [diaSemana, setDiaSemana] = useState("");
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [activo, setActivo] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (activo === 1 && (!horaInicio || !horaFin)) {
      setError("Si el horario está activo, debe especificar horas");
      return;
    }

    if (tipo === "diaSemana" && !diaSemana) {
      setError("Selecciona un día");
      return;
    }

    if (tipo === "especifica" && !fecha) {
      setError("Selecciona una fecha");
      return;
    }

    try {
      setSaving(true);
      await apiClient.post("/barberos/horarios", {
        idBarbero,
        diaSemana: tipo === "diaSemana" ? parseInt(diaSemana) : null,
        fechaEspecifica: tipo === "especifica" ? fecha : null,
        horaInicio: activo === 1 ? horaInicio : null,
        horaFin: activo === 1 ? horaFin : null,
        activo
      });
      alert("✅ Horario creado");
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px", maxWidth: "450px", width: "90%" }}>
        <h3>Nuevo Horario</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={activo === 1}
                onChange={(e) => setActivo(e.target.checked ? 1 : 0)}
                disabled={saving}
              />
              <span>Activo (Si desactivas, este día/horario no se trabaja)</span>
            </label>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Tipo:</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ width: "100%", padding: "8px", fontSize: "14px" }} disabled={saving}>
              <option value="diaSemana">Día de la Semana</option>
              <option value="especifica">Fecha Específica</option>
            </select>
          </div>

          {tipo === "diaSemana" && (
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Día:</label>
              <select value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)} style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving}>
                <option value="">-- Selecciona un día --</option>
                <option value="1">Lunes</option>
                <option value="2">Martes</option>
                <option value="3">Miércoles</option>
                <option value="4">Jueves</option>
                <option value="5">Viernes</option>
                <option value="6">Sábado</option>
                <option value="7">Domingo</option>
              </select>
            </div>
          )}

          {tipo === "especifica" && (
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Fecha:</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving} />
            </div>
          )}

          {activo === 1 && (
            <>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Hora Inicio:</label>
                <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving} />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Hora Fin:</label>
                <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving} />
              </div>
            </>
          )}

          {activo === 0 && (
            <div style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#fff3cd", borderRadius: "4px", color: "#856404" }}>
              ⚠️ Este día/horario está marcado como inactivo. No se requerirán horas ya que el barbero no trabajará en este día.
            </div>
          )}

          {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" disabled={saving} style={{ backgroundColor: "#4CAF50", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              {saving ? "Creando..." : "Crear"}
            </button>
            <button type="button" onClick={onClose} style={{ backgroundColor: "#666", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Funciones auxiliares
const getNombreDia = (numero) => {
  const dias = { 1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado", 7: "Domingo" };
  return dias[numero] || numero;
};

async function eliminarServicioBarbero(idBarbero, idServicio, onSuccess) {
  if (!window.confirm("¿Confirmar eliminación?")) return;
  try {
    await apiClient.delete("/barberos/servicios", {
      idBarbero,
      servicios: [idServicio]
    });
    alert("✅ Servicio eliminado");
    onSuccess();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

async function eliminarHorario(idHorario, onSuccess) {
  if (!window.confirm("¿Confirmar eliminación?")) return;
  try {
    await apiClient.delete(`/barberos/horarios/${idHorario}`);
    alert("✅ Horario eliminado");
    onSuccess();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

// Tab Servicios
function TabServicios({ servicios, cargando, setServicioEditar, setShowFormServicio, servicioEditar, showFormServicio, onRefresh }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Gestión de Servicios</h2>
        <button
          onClick={() => { setServicioEditar(null); setShowFormServicio(true); }}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          ➕ Nuevo Servicio
        </button>
      </div>

      {showFormServicio && <FormServicio servicioEditar={servicioEditar} onClose={() => setShowFormServicio(false)} onSuccess={() => { setShowFormServicio(false); onRefresh(); }} />}

      {cargando ? <p>Cargando servicios...</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>ID</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Nombre</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>Duración (min)</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>Costo ($)</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No hay servicios registrados</td></tr>
            ) : (
              servicios.map(servicio => (
                <tr key={servicio.idServicio}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{servicio.idServicio}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{servicio.nombreServicio}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>{servicio.duracion}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>${servicio.costo}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                    <button onClick={() => { setServicioEditar(servicio); setShowFormServicio(true); }} style={{ backgroundColor: "#FF9800", color: "white", padding: "5px 10px", border: "none", borderRadius: "4px", cursor: "pointer" }}>Editar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Formulario Servicio
function FormServicio({ servicioEditar, onClose, onSuccess }) {
  const [nombre, setNombre] = useState(servicioEditar?.nombreServicio || "");
  const [duracion, setDuracion] = useState(servicioEditar?.duracion || "");
  const [costo, setCosto] = useState(servicioEditar?.costo || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // useEffect para asegurar pre-llenado
  useEffect(() => {
    if (servicioEditar) {
      setNombre(servicioEditar.nombreServicio || "");
      setDuracion(servicioEditar.duracion || "");
      setCosto(servicioEditar.costo || "");
    }
  }, [servicioEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nombre || !duracion || !costo) {
      setError("Todos los campos son requeridos");
      return;
    }

    try {
      setSaving(true);
      if (servicioEditar) {
        await apiClient.put(`/servicios/${servicioEditar.idServicio}`, {
          nombreServicio: nombre,
          duracion: parseInt(duracion),
          costo: parseFloat(costo)
        });
        alert("✅ Servicio actualizado");
      } else {
        await apiClient.post("/servicios", {
          nombreServicio: nombre,
          duracion: parseInt(duracion),
          costo: parseFloat(costo)
        });
        alert("✅ Servicio creado");
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px", maxWidth: "400px", width: "90%" }}>
        <h3>{servicioEditar ? "Editar Servicio" : "Nuevo Servicio"}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Nombre:</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Duración (minutos):</label>
            <input type="number" value={duracion} onChange={(e) => setDuracion(e.target.value)} style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Costo ($):</label>
            <input type="number" step="0.01" value={costo} onChange={(e) => setCosto(e.target.value)} style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving} />
          </div>
          {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" disabled={saving} style={{ backgroundColor: "#4CAF50", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" onClick={onClose} style={{ backgroundColor: "#666", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Tab Clientes
function TabClientes({ usuarios, cargando }) {
  const clientes = usuarios.filter(u => u.nombreRol === "cliente");
  return (
    <div>
      <h2>Listado de Clientes</h2>
      {cargando ? <p>Cargando clientes...</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>ID</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Nombre</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Email</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr><td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>No hay clientes registrados</td></tr>
            ) : (
              clientes.map(cliente => (
                <tr key={cliente.idUsuario}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{cliente.idUsuario}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{cliente.nombre}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{cliente.correoUsuario}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminPage;
