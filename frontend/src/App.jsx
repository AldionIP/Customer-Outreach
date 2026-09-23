import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerForm from "./pages/CustomerForm";
import CustomerDetail from "./pages/CustomerDetail";
import CustomerEdit from "./pages/CustomerEdit";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;