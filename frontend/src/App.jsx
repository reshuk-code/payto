import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateQuote from './pages/CreateQuote';
import Checkout from './pages/Checkout';

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.log('Not logged in or token expired');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        {user && (
          <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
            <div className="font-bold text-xl text-blue-600">QuotePay</div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700">{user.name}</span>
              <button onClick={logout} className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 transition">Logout</button>
            </div>
          </nav>
        )}
        <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={login} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register onLogin={login} /> : <Navigate to="/" />} />

            <Route path="/" element={user ? <Dashboard user={user} refreshUser={fetchUser} /> : <Navigate to="/login" />} />
            <Route path="/create" element={user ? <CreateQuote /> : <Navigate to="/login" />} />

            <Route path="/pay/:quoteId" element={<Checkout />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
