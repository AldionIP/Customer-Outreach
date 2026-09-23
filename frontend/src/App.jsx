import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerForm from "./pages/CustomerForm";
import CustomerDetail from "./pages/CustomerDetail";
import CustomerEdit from "./pages/CustomerEdit";
import ImportCustomers from "./pages/ImportCustomers";
import LearningBook from "./pages/LearningBook";
import WhatsAppOutreach from "./pages/WhatsAppOutreach";
import Report from "./pages/Report";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/customers"
          element={<Customers />}
        />

        <Route
          path="/customers/new"
          element={<CustomerForm />}
        />

        <Route
          path="/customers/:id"
          element={<CustomerDetail />}
        />

        <Route
          path="/customers/:id/edit"
          element={<CustomerEdit />}
        />

        <Route
          path="/customers/import"
          element={<ImportCustomers />}
        />

        <Route
          path="/outreach/whatsapp"
          element={<WhatsAppOutreach />}
        />

        <Route
          path="/reports"
          element={<Report />}
        />

        <Route
          path="/learning-book"
          element={<LearningBook />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;