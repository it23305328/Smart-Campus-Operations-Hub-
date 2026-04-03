import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';

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
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 shadow-xl relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Smart Campus <span className="text-blue-300 font-light">Hub</span>
          </h1>
          <nav className="hidden md:flex space-x-6 text-sm font-medium items-center">
            {user && (
              <>
                <span className="text-blue-200">Welcome, {user.name} ({user.role})</span>
                <a href="/" className="hover:text-blue-300 transition">Dashboard</a>
                <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition">Logout</button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-grow bg-slate-50 relative">
        <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] bg-[length:20px_20px]"></div>
        <div className="max-w-7xl mx-auto p-8 relative z-10">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/loginSuccess" element={<Navigate to="/" />} />
            <Route path="/" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
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
        Select a system module below to jump into the control center. Managing campus operations has never been this seamless.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <ModuleCard title="Facilities" description="Monitor room status, manage assets and track equipment in real-time." color="from-teal-400 to-emerald-500" icon="🏢" />
        <ModuleCard title="Bookings" description="Handle schedule requests and approve venue reservations systematically." color="from-sky-400 to-blue-500" icon="📅" />
        <ModuleCard title="Incidents" description="Review reported faults, maintenance issues and assign field staff." color="from-rose-400 to-red-500" icon="🚨" />
        <ModuleCard title="Notifications" description="Broadcast alerts across the campus and manage subscriber preferences." color="from-amber-400 to-orange-500" icon="🔔" />
      </div>
    </div>
  );
}

function ModuleCard({ title, description, color, icon }) {
  return (
    <div className={`relative overflow-hidden group p-8 rounded-2xl text-white shadow-lg shadow-slate-300/50 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-400/50 bg-gradient-to-br ${color}`}>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
        <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform origin-bottom-left">{icon}</div>
        <h3 className="text-2xl font-bold mb-3 tracking-wide">{title}</h3>
        <p className="text-white/90 text-sm leading-relaxed">{description}</p>
        <div className="mt-6 flex items-center text-sm font-semibold text-white/80 group-hover:text-white transition-colors duration-300">
            <span>Manage Module</span>
            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </div>
    </div>
  );
}

