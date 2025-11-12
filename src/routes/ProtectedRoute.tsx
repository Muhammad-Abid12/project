import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();

    // If there is **no** user → go to login (preserve intended URL)
    return user ? <>{children}</> : <Navigate to="/login" replace />;
};