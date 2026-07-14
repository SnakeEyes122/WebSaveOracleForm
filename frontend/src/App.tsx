
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Repository from './pages/Repository';

// Placeholder components for routes
const Projects = () => <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">Projects Management coming soon...</div>;
const Modules = () => <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">Modules Management coming soon...</div>;
const Users = () => <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">User Management coming soon...</div>;
const AuditLogs = () => <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">Audit Logs coming soon...</div>;

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="repository" element={<Repository />} />
              <Route path="projects" element={<Projects />} />
              <Route path="modules" element={<Modules />} />
              <Route path="users" element={<Users />} />
              <Route path="audit-logs" element={<AuditLogs />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
