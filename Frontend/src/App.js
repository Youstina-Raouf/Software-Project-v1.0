import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './AuthContext';
import Navbar from './components/Navbar';
import Footer from './Footer';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './ForgotPassword';
import Unauthorized from './Unauthorized';
import Profile from './components/Profile';
import UpdateProfileForm from './UpdateProfileForm';
import EventList from './EventList';
import EventDetails from './EventDetails';
import EventForm from './EventForm';
import EventAnalytics from './EventAnalytics';
import AdminPage from './AdminPage';
import OrganizerDashboard from './OrganizerDashboard';
import UserBookingsPage from './UserBookingsPage';
import BookingDetails from './BookingDetails';
import ProtectedRoute from './ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <ToastContainer position="top-center" />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/events" element={<EventList />} />
              <Route path="/events/:id" element={<EventDetails />} />

              {/* Protected Routes - All Authenticated Users */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile/edit" 
                element={
                  <ProtectedRoute>
                    <UpdateProfileForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bookings" 
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <UserBookingsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bookings/:id" 
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <BookingDetails />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Routes - Event Organizers */}
              <Route 
                path="/my-events" 
                element={
                  <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-events/new" 
                element={
                  <ProtectedRoute allowedRoles={['organizer']}>
                    <EventForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-events/:id/edit" 
                element={
                  <ProtectedRoute allowedRoles={['organizer']}>
                    <EventForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-events/analytics" 
                element={
                  <ProtectedRoute allowedRoles={['organizer']}>
                    <EventAnalytics />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Routes - Admin */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/events" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/organizers" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/analytics" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
