import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, Mail, Lock } from '@mui/icons-material';
import { MailIcon, LockIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Initialize Supabase client (replace with your actual URL and anon key)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      /*   const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
  
        if (error) throw error;
  
        if (data.user) {
          navigate('/dashboard'); // Change to your protected route
        } */
      await login(email, password);

      navigate('/dashboard'); // Change to your protected route
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Logo / Title */}
        <Typography component="h1" variant="h4" fontWeight="bold" color="primary">
          Welcome Back
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Sign in to your account
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailIcon className="w-5 h-5 text-gray-500" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon className="w-5 h-5 text-gray-500" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading || !email || !password}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>

          {/* Optional: Forgot Password */}
          <Typography variant="body2" align="center">
            <Button
              onClick={() => alert('Password reset not implemented')}
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Forgot password?
            </Button>
          </Typography>
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Typography variant="body2" align="center">
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: '#1976d2',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}