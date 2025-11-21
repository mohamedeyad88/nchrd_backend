import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout + Pages
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Students from './pages/Students';
import Companies from './pages/Companies';
import Evaluations from './pages/Evaluations';
import TrainingDays from './pages/TrainingDays';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

// حماية المسارات
const PrivateRoute = ({ children }) => {
  const logged = localStorage.getItem("access_token");
  return logged ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <>
      <CssBaseline />
      <ToastContainer position="top-center" autoClose={3000} rtl theme="dark" />

      <Router>
        <Routes>

          {/* صفحة تسجيل الدخول */}
          <Route path="/login" element={<Login />} />

          {/* الصفحات داخل الـ Layout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="students" element={<Students />} />
            <Route path="companies" element={<Companies />} />
            <Route path="evaluations" element={<Evaluations />} />
            <Route path="training-days" element={<TrainingDays />} />
            <Route path="users" element={<Users />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
          </Route>

        </Routes>
      </Router>
    </>
  );
}
