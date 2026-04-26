import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Suppliers from './Suppliers';
import Materials from './Materials';
import PurchaseOrders from './PurchaseOrders';
import Products from './Products';
import ProductionOrders from './ProductionOrders';
import QualityChecks from './QualityChecks';
import Shipments from './Shipments';

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
