import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Suppliers from './Suppliers';
import Materials from './Materials';
import PurchaseOrders from './PurchaseOrders';
import Products from './Products';
import ProductionOrders from './ProductionOrders';
import QualityChecks from './QualityChecks';
import Shipments from './Shipments';
import Employees from './Employees';
import UserRights from './UserRights';
import ChangePassword from './ChangePassword';
import Login from './Login';

export default function App() {
  const [user, setUser] = useState(null);
  const [allowedPages, setAllowedPages] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('erp_user');
    const savedPages = localStorage.getItem('erp_pages');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setAllowedPages(JSON.parse(savedPages || '[]'));
    }
  }, []);

  const handleLogin = (userData, pages) => {
    setUser(userData);
    setAllowedPages(pages);
  };

  const handleLogout = () => {
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_pages');
    setUser(null);
    setAllowedPages([]);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const canAccess = (path) => user.role === 'admin' || allowedPages.includes(path);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-950 text-white font-sans">
        <Sidebar user={user} onLogout={handleLogout} allowedPages={allowedPages} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/suppliers" element={canAccess('/suppliers') ? <Suppliers /> : <Navigate to="/" />} />
              <Route path="/materials" element={canAccess('/materials') ? <Materials /> : <Navigate to="/" />} />
              <Route path="/purchase-orders" element={canAccess('/purchase-orders') ? <PurchaseOrders /> : <Navigate to="/" />} />
              <Route path="/products" element={canAccess('/products') ? <Products /> : <Navigate to="/" />} />
              <Route path="/production" element={canAccess('/production') ? <ProductionOrders /> : <Navigate to="/" />} />
              <Route path="/quality" element={canAccess('/quality') ? <QualityChecks /> : <Navigate to="/" />} />
              <Route path="/shipments" element={canAccess('/shipments') ? <Shipments /> : <Navigate to="/" />} />
              <Route path="/employees" element={canAccess('/employees') ? <Employees /> : <Navigate to="/" />} />
              <Route path="/user-rights" element={canAccess('/user-rights') ? <UserRights /> : <Navigate to="/" />} />
              <Route path="/change-password" element={<ChangePassword user={user} />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}