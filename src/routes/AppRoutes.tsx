import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import MessagingApp from '../components/MessagingApp';
import { CircularProgress, Box } from '@mui/material';

export default function AppRoutes() {
    const { user, loading } = useAuth();

    // Show a spinner while Supabase decides the auth state
    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Routes>
            {/* ---------- PUBLIC (only when NOT logged in) ---------- */}
            <Route
                path="/login"
                element={
                    user ? <Navigate to="/" replace /> : <Login />
                }
            />
            <Route
                path="/register"
                element={
                    user ? <Navigate to="/" replace /> : <Register />
                }
            />

            {/* ---------- PROTECTED (only when logged in) ---------- */}
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <MessagingApp />
                    </ProtectedRoute>
                }
            />

            {/* Optional: explicit dashboard (same as /* above) */}
            <Route path="/dashboard" element={<ProtectedRoute><MessagingApp /></ProtectedRoute>} />
        </Routes>
    );
}