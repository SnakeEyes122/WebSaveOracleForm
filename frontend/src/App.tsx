
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Repository from './pages/Repository';
import Systems from './pages/Systems';
import FileTypes from './pages/FileTypes';
import AuditLogs from './pages/AuditLogs';
import Users from './pages/Users';

import { ThemeProvider } from './context/ThemeContext';
import { AlertProvider } from './context/AlertContext';

// Placeholder components for routes

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AlertProvider>
          <AuthProvider>
            <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="repository" element={<Repository />} />
                <Route path="systems" element={<Systems />} />
                <Route path="file-types" element={<FileTypes />} />
                <Route path="users" element={<Users />} />
                <Route path="audit-logs" element={<AuditLogs />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </AlertProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
