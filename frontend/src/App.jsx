import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Layout from './components/Layout';
import Users from './pages/admin/Users';
import Managers from './pages/admin/Managers';
import Spaces from './pages/admin/Spaces';

import AdminCalendar from './pages/admin/AdminCalendar';
import StudentCalendar from './pages/student/StudentCalendar';
import StudentReservationFlow from './pages/student/StudentReservationFlow';
import ReservationFlow from './pages/admin/ReservationFlow';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
      return <div className="flex-center" style={{height: '100vh'}}>Iniciando aplicación...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Navigate to={user?.role === 'admin' ? "/admin/calendar" : "/student/calendar"} replace /></ProtectedRoute>} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Rutas de Alumno */}
        <Route path="/student/calendar" element={<StudentCalendar />} />
        <Route path="/student/reserve" element={<StudentReservationFlow />} />

        {/* Rutas de Admin */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Outlet/></ProtectedRoute>}>
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="spaces" element={<Spaces />} />
            <Route path="managers" element={<Managers />} />
            <Route path="users" element={<Users />} />
            <Route path="reserve" element={<ReservationFlow />} />
        </Route>
      </Route>
    </Routes>
  );
}



export default App;
