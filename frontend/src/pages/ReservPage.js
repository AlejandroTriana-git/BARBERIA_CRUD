import ReservForm from '../components/ReservForm';
import ResevList from '../components/ResevList';
import { useState } from 'react';


function ReservPage() {

  const [actualizarLista, setActualizarLista] = useState(0);
  const [reservaEditar, setReservaEditar] = useState(null);

  const handleReservaCreada = () => {
    // Incrementar el contador para forzar actualización de la lista
    setActualizarLista(prev => prev + 1);
  };

  const handleEditarReserva = (reserva) => {
    setReservaEditar(reserva);
    // Scroll hacia arriba para ver el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelarEdicion = () => {
    setReservaEditar(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Sistema de Reservas</h1>
      
      <ReservForm 
        reservaEditar={reservaEditar}
        onReservaCreada={handleReservaCreada}
        onCancelarEdicion={handleCancelarEdicion}
      />
      <hr /> {/* Separador visual */}
      
      <ResevList
        actualizarLista={actualizarLista}
        onEditarReserva={handleEditarReserva}
      />
    </div>
  );
}
export default ReservPage;