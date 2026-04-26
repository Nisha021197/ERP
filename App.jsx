import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Suppliers from './pages/Suppliers';
import Materials from './pages/Materials';
import PurchaseOrders from './pages/PurchaseOrders';
import Products from './pages/Products';
import ProductionOrders from './pages/ProductionOrders';
import QualityChecks from './pages/QualityChecks';
import Shipments from './pages/Shipments';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-950 text-white font-sans">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/purchase-orders" element={<PurchaseOrders />} />
              <Route path="/products" element={<Products />} />
              <Route path="/production" element={<ProductionOrders />} />
              <Route path="/quality" element={<QualityChecks />} />
              <Route path="/shipments" element={<Shipments />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
