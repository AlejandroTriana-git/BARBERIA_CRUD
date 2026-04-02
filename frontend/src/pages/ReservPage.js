import ReservForm from '../components/ReservForm';
import ResevList from '../components/ResevList';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';


function ReservPage() {

  const location = useLocation();
  const [actualizarLista, setActualizarLista] = useState(0);
  const [reservaEditar, setReservaEditar] = useState(null);

  // Recibir la reserva del estado de navegación si viene de ClientPage
  useEffect(() => {
    if (location.state?.reservaEditar) {
      setReservaEditar(location.state.reservaEditar);
    }
  }, [location.state]);

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