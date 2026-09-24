import { BrowserRouter, Route, Routes } from "react-router-dom";

import MechaBattleAnimation from "./components/MechaBattleAnimation";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerForm from "./pages/CustomerForm";
import CustomerDetail from "./pages/CustomerDetail";
import CustomerEdit from "./pages/CustomerEdit";
import ImportCustomers from "./pages/ImportCustomers";
import LearningBook from "./pages/LearningBook";
import Report from "./pages/Report";
import WhatsAppOutreach from "./pages/WhatsAppOutreach";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell text-slate-100">
        <div className="bg-grid" />

        <Navbar />
        <MechaBattleAnimation />

        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/customers/:id/edit" element={<CustomerEdit />} />
            <Route path="/customers/import" element={<ImportCustomers />} />
            <Route path="/outreach/whatsapp" element={<WhatsAppOutreach />} />
            <Route path="/reports" element={<Report />} />
            <Route path="/learning-book" element={<LearningBook />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;