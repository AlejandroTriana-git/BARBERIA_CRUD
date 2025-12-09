


import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ClientPage from './pages/ClientPage';
import ReservPage from './pages/ReservPage';

// import OtraPagina from './pages/OtraPagina'; // Cuando la crees
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar/>
        
        <main className="main-content">
          <Routes>
            {/* Ruta principal - Client */}
            <Route path="/" element={<ClientPage />} />
            
            {/* Ruta - Reservas*/}
            <Route path="/reservas" element={<ReservPage />} /> 
            
            {/* Ruta 404 - Página no encontrada */}
            <Route path="*" element={
              <div>
                <h2>Página no encontrada</h2>
                <p>La página que buscas no existe.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;