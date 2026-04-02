import React, { useState, useEffect } from "react";
import apiClient from "../services/apiClient";

function ClientForm({ clientToEdit, onSaveComplete }) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (clientToEdit) {
      setNombre(clientToEdit.nombreCliente || "");
      setTelefono(clientToEdit.telefonoCliente || "");
    } else {
      setNombre("");
      setTelefono("");
      setError("");
    }
  }, [clientToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // VALIDACIÓN DE TELÉFONO
    if (!/^[0-9]+$/.test(telefono)) {
      setError("¡En el campo teléfono solo se aceptan números!");
      return;
    }

    if (telefono.length !== 10) {
      setError("El teléfono debe tener exactamente 10 dígitos");
      return;
    }

    setSaving(true);
    const payload = {
      nombreCliente: nombre.trim(),
      telefonoCliente: telefono.trim(),
    };

    const isEdit = Boolean(clientToEdit && clientToEdit.idCliente);
    const url = isEdit ? `/clientes` : `/clientes`;
    const method = isEdit ? "PUT" : "PUT";

    try {
      await apiClient[method.toLowerCase()](url, payload);
      alert(
        isEdit
          ? `Cliente ${nombre} actualizado`
          : `Cliente ${nombre} creado`
      );

      // limpiar formulario
      setNombre("");
      setTelefono("");
      setError("");

      // notificar al padre
      if (typeof onSaveComplete === "function") onSaveComplete();
    } catch (err) {
      console.error("Error al guardar:", err);
      setError("Error al guardar: " + (err.message || "Error desconocido"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{clientToEdit ? "Editar Perfil" : "Esta es tu información"}</h2>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
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
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>

        {!clientToEdit && (
          <button
            type="button"
            onClick={() => {
              setNombre("");
              setTelefono("");
              setError("");
              if (typeof onSaveComplete === "function") onSaveComplete();
            }}
            style={{ marginLeft: 8 }}
            disabled={saving}
          >
            Limpiar
          </button>
        )}
      </div>
    </form>
  );
}

export default ClientForm;
