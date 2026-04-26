import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import GuestDashboard from './pages/GuestDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';
import ResourceCatalogue from './pages/facilities/ResourceCatalogue';
import AdminResourceManagement from './pages/facilities/AdminResourceManagement';
import AnalyticsDashboard from './pages/facilities/AnalyticsDashboard';
import TechnicianDashboard from './pages/incidents/TechnicianDashboard';
import TicketDetails from './pages/incidents/TicketDetails';
import TicketForm from './pages/incidents/TicketForm';
import Sidebar from './components/layout/Sidebar';
import Profile from './pages/users/Profile';
import UserDashboard from './pages/UserDashboard';
import AdminBookingRequests from './pages/facilities/AdminBookingRequests';
import MyBookings from './pages/facilities/MyBookings';
import CreateTicket from './pages/CreateTicket';
import IncidentPage from './pages/IncidentPage';


const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}


function AppContent() {
  const { user } = useAuth();
  const location = useLocation();

  const isLandingPage = !user && location.pathname === '/';

  return (
    <div className={`min-h-screen flex font-sans bg-background text-foreground transition-colors duration-500`}>
      {user && <Sidebar />}
      
      <div className="flex-grow flex flex-col min-w-0 relative">
        {!isLandingPage && <Navbar />}
        <main className={`flex-grow relative ${!isLandingPage ? 'overflow-y-auto' : ''}`}>
          {!isLandingPage && <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] bg-[length:20px_20px] pointer-events-none"></div>}
          <div className={`${!isLandingPage ? 'max-w-7xl mx-auto p-8 relative z-10' : ''}`}>
          <Routes>
            {/* Logic from Version 1 */}
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <GuestDashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/loginSuccess" element={<Navigate to="/dashboard" />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Dashboard and Admin Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <UserDashboard />
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


            <Route path="/admin/users" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/facilities" element={
              <PrivateRoute>
                <ResourceCatalogue />
              </PrivateRoute>
            } />

            <Route path="/admin/facilities" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminResourceManagement />
              </ProtectedRoute>
            } />

            <Route path="/admin/bookings" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminBookingRequests />
              </ProtectedRoute>
            } />

            <Route path="/admin/analytics" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />

            <Route path="/incidents" element={
              <PrivateRoute>
                <TechnicianDashboard />
              </PrivateRoute>
            } />

            <Route path="/mybookings" element={
              <PrivateRoute>
                <MyBookings />
              </PrivateRoute>
            } />

            <Route path="/incidents/:id" element={
              <PrivateRoute>
                <TicketDetails />
              </PrivateRoute>
            } />

            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
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
  </div>
);
}