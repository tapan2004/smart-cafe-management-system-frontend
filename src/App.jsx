import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import Billing from './pages/Billing';
import Users from './pages/Users';
import AiFeatures from './pages/AiFeatures';
import Kitchen from './pages/Kitchen';
import Inventory from './pages/Inventory';
import AuditLogs from './pages/AuditLogs';

// Simple PrivateRoute wrapper
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
import GuestOrder from './pages/GuestOrder';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/order" element={<GuestOrder />} />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="menu" element={<Menu />} />
          <Route path="billing" element={<Billing />} />
          <Route path="users" element={<Users />} />
          <Route path="ai" element={<AiFeatures />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="audit" element={<AuditLogs />} />
        </Route>
        {/* Catch-all route to handle invalid URLs */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
