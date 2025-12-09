import { Link } from 'react-router-dom';


function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <h2 className="nav-logo">Mi Sistema</h2>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Clientes
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/reservas" className="nav-link">
              Reservas
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;