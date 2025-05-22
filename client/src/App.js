import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import Unauthorized from './Unauthorized';
import ProfilePage from './ProfilePage';
import UpdateProfileForm from './UpdateProfileForm';
import EventList from './EventList';
import EventDetails from './EventDetails';


function App() {
  return (
    <Router>
      <Navbar />
      <ToastContainer position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<UpdateProfileForm />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/events/:id" element={<EventDetails />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
