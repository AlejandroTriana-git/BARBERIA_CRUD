import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ResevList from "../components/ResevList";
import PerfilUsuario from "../components/PerfilUsuario";

function ClientPage() {
  const navigate = useNavigate();
  const [actualizarLista, setActualizarLista] = useState(0);

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Componente Perfil Usuario (reutilizable) */}
      <PerfilUsuario />

      {/* Sección de Reservas */}
      <div style={{ marginTop: "40px" }}>
        
        <ResevList
          actualizarLista={actualizarLista}
          onEditarReserva={(reserva) => {
            navigate('/reservas', { state: { reservaEditar: reserva } });
          }}
        />
      </div>
    </div>
  );
}

export default ClientPage;
