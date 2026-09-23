import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Customer Outreach
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            Dashboard
          </Link>

          <Link to="/customers" className="navbar-link">
            Customers
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;