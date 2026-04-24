import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';
import CreateTicket from './pages/CreateTicket';
import IncidentPage from './pages/IncidentPage';

/**
 * Helper component to protect routes from unauthenticated users.
 * Redirects to login if no user session is found.
 */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center p-10 font-medium">Loading session...</div>;
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
      {/* Global Navigation Bar */}
      <Navbar />

      <main className="flex-grow bg-slate-50 relative">
        {/* Visual background decoration */}
        <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] bg-[length:20px_20px]"></div>

        <div className="max-w-7xl mx-auto p-8 relative z-10">
          <Routes>
            {/* Public Access Routes */}
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Authenticated Dashboard - Accessible by any logged-in user */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />

            {/* Incident Module: User Route (View Own Tickets) */}
            <Route path="/my-tickets" element={
              <ProtectedRoute roles={['USER', 'ADMIN', 'TECHNICIAN']}>
                <IncidentPage />
              </ProtectedRoute>
            } />

            {/* Incident Module: User Route (Create Ticket) */}
            <Route path="/create-ticket" element={
              <ProtectedRoute roles={['USER', 'ADMIN', 'TECHNICIAN']}>
                <CreateTicket />
              </ProtectedRoute>
            } />

            {/* Incident Module: Admin Route (View/Manage All Tickets) */}
            <Route path="/admin/incidents" element={
              <ProtectedRoute roles={['ADMIN']}>
                <IncidentPage />
              </ProtectedRoute>
            } />

            {/* Incident Module: Technician Route */}
            <Route path="/technician/incidents" element={
              <ProtectedRoute roles={['TECHNICIAN']}>
                <IncidentPage /> 
              </ProtectedRoute>
            } />

            {/* User Management: Admin Only */}
            <Route path="/admin/users" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Placeholder Routes for future modules */}
            <Route path="/bookings" element={<ProtectedRoute roles={['USER']}><div className="p-10 bg-white rounded-xl shadow">My Bookings</div></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute roles={['ADMIN']}><div className="p-10 bg-white rounded-xl shadow">Settings</div></ProtectedRoute>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

/**
 * Dashboard Home Component
 * Directs users to different pages based on their specific role.
 */
function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="text-center py-10">
      <h2 className="text-4xl font-black text-slate-800 mb-6 tracking-tight">Operations Dashboard</h2>
      <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto">
        Welcome back! You are logged in as <span className="font-bold text-indigo-600 underline decoration-indigo-200 underline-offset-4">{user?.role}</span>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
        <ModuleCard title="Facilities" description="Monitor campus rooms." color="from-teal-400 to-emerald-500" icon="🏢" onClick={() => { }} />
        <ModuleCard title="Bookings" description="Manage your reservations." color="from-sky-400 to-blue-500" icon="📅" onClick={() => navigate('/bookings')} />

        {/* DYNAMIC CARD LOGIC: 
            The 'Incidents' card checks the user role before navigating.
            Admins go to the Ticket Manager, Users go to the Report Form.
        */}
        <ModuleCard
          title="Incidents"
          description={user?.role === 'ADMIN' ? "Manage and assign support tickets." : "Submit a new maintenance request."}
          color="from-rose-400 to-red-500"
          icon="🚨"
          onClick={() => {
            if (user?.role === 'ADMIN') {
              navigate('/admin/incidents');
            } else if (user?.role === 'TECHNICIAN') {
              navigate('/technician/incidents');
            } else {
              navigate('/my-tickets');
            }
          }}
        />

        <ModuleCard title="Notifications" description="View system alerts." color="from-amber-400 to-orange-500" icon="🔔" onClick={() => navigate('/admin/notifications')} />
      </div>
    </div>
  );
}

/**
 * Reusable Card Component for the Dashboard
 */
function ModuleCard({ title, description, color, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden group p-8 rounded-2xl text-white shadow-xl bg-gradient-to-br ${color} transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-white/10`}
    >
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-white/90 text-sm leading-relaxed">{description}</p>
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
    </div>
  );
}