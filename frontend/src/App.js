
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClientPage from './pages/ClientPage';
import ReservPage from './pages/ReservPage';
import AdminPage from './pages/AdminPage';
import BarberoPage from './pages/BarberoPage';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Cargando aplicación...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />

        <main className="main-content">
          <Routes>
            {/* Rutas públicas de autenticación */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Rutas privadas - Cliente */}
            <Route
              path="/"
              element={
                <PrivateRoute requiredRole={1}>
                  <ClientPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/reservas"
              element={
                <PrivateRoute requiredRole={1}>
                  <ReservPage />
                </PrivateRoute>
              }
            />

            {/* Rutas privadas - Admin */}
            <Route
              path="/admin"
              element={
                <PrivateRoute requiredRole={3}>
                  <AdminPage />
                </PrivateRoute>
              }
            />

            {/* Rutas privadas - Barbero */}
            <Route
              path="/barbero"
              element={
                <PrivateRoute requiredRole={2}>
                  <BarberoPage />
                </PrivateRoute>
              }
            />

            {/* Ruta 404 */}
            <Route path="*" element={
              <div style={{ textAlign: 'center', padding: '50px' }}>
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