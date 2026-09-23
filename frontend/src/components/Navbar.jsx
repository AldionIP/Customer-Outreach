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

          <Link to="/customers/import" className="navbar-link">
            Import
          </Link>

          <Link to="/outreach/whatsapp" className="navbar-link">
            WhatsApp
          </Link>

          <Link to="/reports" className="navbar-link">
            Report
          </Link>

          <Link to="/learning-book" className="navbar-link">
            Learning Book
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;