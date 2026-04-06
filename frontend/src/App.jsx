import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar from Version 1 */}
      <Navbar />

      <main className="flex-grow bg-slate-50 relative">
        <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] bg-[length:20px_20px]"></div>
        <div className="max-w-7xl mx-auto p-8 relative z-10">
          <Routes>
            {/* Logic from Version 1 */}
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/loginSuccess" element={<Navigate to="/dashboard" />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Dashboard and Admin Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />

            <Route path="/admin/users" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Generic Placeholders */}
            <Route path="/bookings" element={<ProtectedRoute roles={['USER']}> <div>Bookings View Placeholder</div> </ProtectedRoute>} />
            <Route path="/incidents" element={<ProtectedRoute roles={['USER']}> <div>Incidents View Placeholder</div> </ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute roles={['ADMIN']}> <div>All Bookings Placeholder</div> </ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute roles={['ADMIN']}> <div>Notification Settings Placeholder</div> </ProtectedRoute>} />
            <Route path="/technician/incidents" element={<ProtectedRoute roles={['TECHNICIAN']}> <div>My Technician Tickets Placeholder</div> </ProtectedRoute>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  return (
    <div className="text-center py-10">
      <h2 className="text-4xl font-black text-slate-800 mb-6 drop-shadow-sm">Welcome to your Operations Dashboard</h2>
      <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto">
        Logged in as <span className="font-bold text-indigo-600">{user?.role}</span>.
        Select a system module below to jump into the control center.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <ModuleCard title="Facilities" description="Monitor room status, manage assets and track equipment." color="from-teal-400 to-emerald-500" icon="🏢" />
        <ModuleCard title="Bookings" description="Handle schedule requests and approve venue reservations." color="from-sky-400 to-blue-500" icon="📅" />
        <ModuleCard title="Incidents" description="Review reported faults and assign field staff." color="from-rose-400 to-red-500" icon="🚨" />
        <ModuleCard title="Notifications" description="Broadcast alerts and manage subscriber preferences." color="from-amber-400 to-orange-500" icon="🔔" />
      </div>
    </div>
  );
}

function ModuleCard({ title, description, color, icon }) {
  return (
    <div className={`relative overflow-hidden group p-8 rounded-2xl text-white shadow-lg bg-gradient-to-br ${color} transition-all hover:-translate-y-2 cursor-pointer`}>
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-white/90 text-sm">{description}</p>
    </div>
  );
}