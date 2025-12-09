
import React, { useState, useEffect } from "react";



function ClientForm({ clientToEdit, onSaveComplete }) {
  
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [saving, setSaving] = useState(false);

  // URL base (opcional: usa REACT_APP_API_URL en .env)
  const API = process.env.REACT_APP_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (clientToEdit) {
      setNombre(clientToEdit.nombre || "");
      setCorreo(clientToEdit.correo || "");
      setTelefono(clientToEdit.telefono || "");
    } else {
      setNombre("");
      setCorreo("");
      setTelefono("");
    }
  }, [clientToEdit]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // VALIDACIÓN DE TELÉFONO
    if (!/^[0-9]+$/.test(telefono)) {
      alert("¡En el campo teléfono solo se aceptan números!");
      return; // Detener envío
    }
    
    setSaving(true);
    const payload = {
      nombre: nombre.trim(),
      correo: correo.trim(),
      telefono: telefono.trim(),
    };

    const isEdit = Boolean(clientToEdit && (clientToEdit.idCliente));
    const url = isEdit
      ? `${API}/usuarios/${clientToEdit.idCliente}`
      : `${API}/usuarios`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `Error ${res.status}`);
      }
      
      const data = await res.json();
      alert(isEdit ? `Cliente ${data.nombre} actualizado` : `Cliente ${data.nombre} creado`);
      
      // limpiar formulario en modo creación
      setNombre("");
      setCorreo("");
      setTelefono("");

      // notificar al padre (por ejemplo App hará setSelectedClient(null) y refrescará lista)
      if (typeof onSaveComplete === "function") onSaveComplete();
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Error al guardar: " + (err.message || "Error desconocido"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{clientToEdit ? "Editar Cliente" : "Agregar Cliente"}</h2>

      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="Correo"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        maxLength={10}
        required
      />

      <div style={{ marginTop: 10 }}>
        <button type="submit" disabled={saving}>
          {saving ? (clientToEdit ? "Actualizando..." : "Guardando...") : (clientToEdit ? "Actualizar" : "Guardar")}
        </button>


        {!clientToEdit && (
          <button
            type="button"
            onClick={() => {
              // cancelar edición: limpiar
              setNombre("");
              setCorreo("");
              setTelefono("");
              if (typeof onSaveComplete === "function") onSaveComplete();
            }}
            style={{ marginLeft: 8 }}
            disabled={saving}
          >
            Limpiar
          </button>
        )}

        {clientToEdit && (
          <button
            type="button"
            onClick={() => {
              // cancelar edición: limpiar y notificar al padre
              setNombre("");
              setCorreo("");
              setTelefono("");
              if (typeof onSaveComplete === "function") onSaveComplete();
            }}
            style={{ marginLeft: 8 }}
            disabled={saving}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default ClientForm;
