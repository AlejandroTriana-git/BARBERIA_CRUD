import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../services/apiClient";

function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("barberos");
  const [profileData, setProfileData] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Barberos
  const [barberos, setBarberos] = useState([]);
  const [barbaroEditar, setBarberoEditar] = useState(null);
  const [showFormBarbero, setShowFormBarbero] = useState(false);
  const [cargandoBarberos, setCargandoBarberos] = useState(false);

  // Servicios
  const [servicios, setServicios] = useState([]);
  const [servicioEditar, setServicioEditar] = useState(null);
  const [showFormServicio, setShowFormServicio] = useState(false);
  const [cargandoServicios, setCargandoServicios] = useState(false);

  // Clientes
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);

  // Horarios
  const [horarios, setHorarios] = useState([]);
  const [showFormHorario, setShowFormHorario] = useState(false);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  useEffect(() => {
    cargarPerfil();
  }, []);

  useEffect(() => {
    if (activeTab === "barberos") cargarBarberos();
    else if (activeTab === "servicios") cargarServicios();
    else if (activeTab === "clientes") cargarUsuarios();
  }, [activeTab]);

  const cargarPerfil = async () => {
    try {
      const data = await apiClient.get("/clientes");
      setProfileData(data);
    } catch (err) {
      console.error("Error al cargar perfil:", err);
    }
  };

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

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Panel de Administración</h1>
        <button
          onClick={() => setShowEditProfile(true)}
          style={{
            backgroundColor: "#2196F3",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          ✏️ Editar Perfil
        </button>
      </div>

      {/* Navegación de pestañas */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", borderBottom: "2px solid #ddd" }}>
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
        <button
          onClick={() => setActiveTab("horarios")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "horarios" ? "#667eea" : "#ddd",
            color: activeTab === "horarios" ? "white" : "black",
            border: "none",
            borderRadius: "5px 5px 0 0",
            cursor: "pointer",
            fontWeight: activeTab === "horarios" ? "bold" : "normal",
          }}
        >
          🕐 Horarios
        </button>
      </div>

      {/* Contenido por pestaña */}
      <div style={{ background: "white", padding: "20px", borderRadius: "10px", minHeight: "400px" }}>
        {activeTab === "barberos" && <TabBarberos barberos={barberos} cargando={cargandoBarberos} setBarberoEditar={setBarberoEditar} setShowFormBarbero={setShowFormBarbero} barbaroEditar={barbaroEditar} showFormBarbero={showFormBarbero} onRefresh={cargarBarberos} />}
        {activeTab === "servicios" && <TabServicios servicios={servicios} cargando={cargandoServicios} setServicioEditar={setServicioEditar} setShowFormServicio={setShowFormServicio} servicioEditar={servicioEditar} showFormServicio={showFormServicio} onRefresh={cargarServicios} />}
        {activeTab === "clientes" && <TabClientes usuarios={usuarios} cargando={cargandoUsuarios} />}
        {activeTab === "horarios" && <TabHorarios barberos={barberos} cargando={cargandoHorarios} />}
      </div>

      {/* Modal Editar Perfil Admin */}
      {showEditProfile && <ModalEditarPerfilAdmin profileData={profileData} onClose={() => setShowEditProfile(false)} onSuccess={() => { setShowEditProfile(false); cargarPerfil(); }} />}
    </div>
  );
}

// Tab Barberos
function TabBarberos({ barberos, cargando, setBarberoEditar, setShowFormBarbero, barbaroEditar, showFormBarbero, onRefresh }) {
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

      {showFormBarbero && <FormBarbero barbaroEditar={barbaroEditar} onClose={() => setShowFormBarbero(false)} onSuccess={() => { setShowFormBarbero(false); onRefresh(); }} />}

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
                  <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                    <button onClick={() => { setBarberoEditar(barbero); setShowFormBarbero(true); }} style={{ backgroundColor: "#FF9800", color: "white", padding: "5px 10px", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "5px" }}>Editar</button>
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

// Formulario Barbero
function FormBarbero({ barbaroEditar, onClose, onSuccess }) {
  const [nombre, setNombre] = useState(barbaroEditar?.nombreBarbero || "");
  const [telefono, setTelefono] = useState(barbaroEditar?.telefonoBarbero || "");
  const [email, setEmail] = useState(barbaroEditar?.correoUsuario || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nombre || !telefono || !email) {
      setError("Todos los campos son requeridos");
      return;
    }

    try {
      setSaving(true);
      if (barbaroEditar) {
        await apiClient.put(`/barberos/${barbaroEditar.idBarbero}`, {
          nombreBarbero: nombre,
          telefonoBarbero: telefono,
          correoUsuario: email
        });
        alert("✅ Barbero actualizado");
      } else {
        await apiClient.post("/barberos", {
          nombreBarbero: nombre,
          telefonoBarbero: telefono,
          correoUsuario: email
        });
        alert("✅ Barbero creado");
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
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving} />
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

// Tab Horarios
function TabHorarios({ barberos, cargando }) {
  const [idBarberoSeleccionado, setIdBarberoSeleccionado] = useState("");
  const [tipo, setTipo] = useState("diaSemana");
  const [diaSemana, setDiaSemana] = useState("");
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!idBarberoSeleccionado || !horaInicio || !horaFin) {
      setError("Barbero, hora inicio y fin son requeridas");
      return;
    }

    if (tipo === "diaSemana" && !diaSemana) {
      setError("Selecciona un día de la semana");
      return;
    }

    if (tipo === "especifica" && !fecha) {
      setError("Selecciona una fecha específica");
      return;
    }

    try {
      setSaving(true);
      await apiClient.post("/barberos/horarios", {
        idBarbero: parseInt(idBarberoSeleccionado),
        diaSemana: tipo === "diaSemana" ? diaSemana : null,
        fechaEspecifica: tipo === "especifica" ? fecha : null,
        horaInicio,
        horaFin,
        activo: 1
      });
      alert("✅ Horario creado");
      setIdBarberoSeleccionado("");
      setDiaSemana("");
      setFecha("");
      setHoraInicio("");
      setHoraFin("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2>Gestión de Horarios</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: "500px", marginBottom: "30px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Barbero:</label>
          <select value={idBarberoSeleccionado} onChange={(e) => setIdBarberoSeleccionado(e.target.value)} style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving}>
            <option value="">-- Selecciona un barbero --</option>
            {barberos.map(b => <option key={b.idBarbero} value={b.idBarbero}>{b.nombreBarbero}</option>)}
          </select>
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
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
              <option value="Sábado">Sábado</option>
            </select>
          </div>
        )}

        {tipo === "especifica" && (
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Fecha:</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving} />
          </div>
        )}

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Hora Inicio:</label>
          <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving} />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Hora Fin:</label>
          <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving} />
        </div>

        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

        <button type="submit" disabled={saving} style={{ backgroundColor: "#4CAF50", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          {saving ? "Guardando..." : "Crear Horario"}
        </button>
      </form>
    </div>
  );
}

// Modal Editar Perfil Admin
function ModalEditarPerfilAdmin({ profileData, onClose, onSuccess }) {
  const [nombre, setNombre] = useState(profileData?.nombreCliente || "");
  const [telefono, setTelefono] = useState(profileData?.telefonoCliente || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[0-9]+$/.test(telefono) || telefono.length !== 10) {
      setError("El teléfono debe tener exactamente 10 dígitos");
      return;
    }

    try {
      setSaving(true);
      await apiClient.put("/clientes", {
        nombreCliente: nombre,
        telefonoCliente: telefono
      });
      alert("✅ Perfil actualizado");
      onSuccess();
    } catch (err) {
      setError(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px", maxWidth: "400px", width: "90%" }}>
        <h2>Editar Perfil</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Nombre:</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Teléfono:</label>
            <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} maxLength="10" style={{ width: "100%", padding: "8px", fontSize: "14px" }} required disabled={saving} />
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

export default AdminPage;
