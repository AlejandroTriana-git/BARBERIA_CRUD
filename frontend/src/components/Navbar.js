import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleName = (rol) => {
    switch (rol) {
      case 1:
        return 'Cliente';
      case 2:
        return 'Barbero';
      case 3:
        return 'Administrador';
      default:
        return 'Usuario';
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h2 className="nav-logo">Mi Sistema Barbería</h2>

        {isAuthenticated ? (
          <>
            <ul className="nav-menu">
              {user?.rol === 1 && (
                <>
                  <li className="nav-item">
                    <Link to="/" className="nav-link">
                      Mi Perfil
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/reservas" className="nav-link">
                      Reservar
                    </Link>
                  </li>
                </>
              )}
              {user?.rol === 2 && (
                <>
                  <li className="nav-item">
                    <Link to="/barbero" className="nav-link">
                      Barbero
                    </Link>
                  </li>
                </>
              )}
              {user?.rol === 3 && (
                <li className="nav-item">
                  <Link to="/admin" className="nav-link">
                    Admin
                  </Link>
                </li>
              )}
            </ul>

            <div className="nav-user">
              <span className="user-info">
                {user?.email} · {getRoleName(user?.rol)}
              </span>
              <button onClick={handleLogout} className="btn-logout">
                Cerrar Sesión
              </button>
            </div>
          </>
        ) : (
          <div className="nav-auth-links">
            <Link to="/login" className="nav-link">
              Ingresar
            </Link>
            <Link to="/register" className="nav-link">
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;