import React, { useState } from "react";
import ClientForm from '../components/ClientForm';
import ClientList from '../components/ClientList';


function ClientPage() {
  
  // -------------------- ESTADO PRINCIPAL --------------------
  // selectedClient almacena el cliente que se está editando actualmente.
  // Si es null, el formulario se usa para crear un nuevo cliente.
  const [selectedClient, setSelectedClient] = useState(null);
  const [refreshList, setRefreshList] = useState(0); //Nuevo para cada vez que edite recargue
  // -------------------- FUNCIÓN: EDITAR --------------------
  /**
   * handleEdit se ejecuta cuando el usuario hace clic en "Editar" desde ClientList.
   * Recibe un objeto cliente y lo almacena en el estado selectedClient.
   * Esto hace que ClientForm cargue sus datos para editar.
   */
  const handleEdit = (client) => {
    setSelectedClient(client);
  };

  // -------------------- FUNCIÓN: GUARDAR COMPLETADO --------------------
  /**
   * handleSaveComplete se ejecuta cuando el formulario termina de guardar o actualizar
   * un cliente correctamente. Limpia el estado selectedClient para resetear el formulario.
   */
  const handleSaveComplete = () => {
    setSelectedClient(null);
    setRefreshList(prev => prev + 1);//Nuevo para cada vez que edite recargue
  };

  // -------------------- RENDERIZADO --------------------
  // Estructura visual principal de la aplicación.
  
  
  
  
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Gestión de Clientes</h1>

      {/* Formulario de creación/edición */}
      <ClientForm
        clientToEdit={selectedClient}       // Prop: cliente actual a editar
        onSaveComplete={handleSaveComplete}     // Prop: callback al guardar
      />
  
      <hr /> {/* Separador visual */}

      {/* Lista de clients */}
      <ClientList
        onEdit={handleEdit} 
        key={refreshList}       //Nuevo para cada vez que edite recargue              // Prop: función que se ejecuta al editar
      />
    </div>
  );
}

export default ClientPage;