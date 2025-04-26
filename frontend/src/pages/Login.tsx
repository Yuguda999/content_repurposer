import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import AuthLayout from '../layouts/AuthLayout';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  CircularProgress,
  useTheme,
  InputAdornment,
  IconButton,
  Divider,
  Fade,
  Zoom,
  Stack
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call the login API
      const response = await authAPI.login(email, password);

      // Store the token
      localStorage.setItem('token', response.access_token);

      // For demo purposes, store some user info
      // In a real app, this would come from the backend
      localStorage.setItem('userName', email.split('@')[0]);
      localStorage.setItem('userEmail', email);

      // Navigate to dashboard
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.message ||
        err.response?.data?.detail ||
        'Failed to login. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AuthLayout>
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '100vh',
          py: { xs: 4, sm: 6, md: 8 },
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
      <Zoom in={true} timeout={500}>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            backgroundColor: theme.palette.mode === 'light'
              ? 'rgba(255, 255, 255, 0.7)'
              : 'rgba(30, 41, 59, 0.6)',
            boxShadow: theme.palette.mode === 'light'
              ? '0 10px 40px rgba(0, 0, 0, 0.1)'
              : '0 10px 40px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            position: 'relative',
            maxWidth: '100%',
            width: '100%',
            zIndex: 10,
          }}
        >
          {/* Decorative elements */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Logo variant="sidebar" />
          </Box>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Typography
              variant="subtitle1"
              align="center"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Sign in to your account
            </Typography>
          </motion.div>

          {error && (
            <Fade in={!!error}>
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    color: theme.palette.error.main
                  }
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              '& .MuiTextField-root': {
                mb: 3,
              },
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <TextField
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
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <TextField
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
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                startIcon={!isLoading && <LoginIcon />}
                sx={{
                  mt: 1,
                  mb: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, #3b82f6 30%, #8b5cf6 90%)'
                    : 'linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                  color: '#ffffff', // Ensure text is white in both modes
                  '&:hover': {
                    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </motion.div>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Or
              </Typography>
            </Divider>

            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Demo Account:
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  demo@example.com / password123
                </Typography>
              </Box>

              <Button
                component={Link}
                to="/signup"
                variant="outlined"
                startIcon={<PersonAddIcon />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 500,
                  color: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.light,
                  borderColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.light,
                }}
              >
                Sign Up
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Zoom>
    </Container>
    </AuthLayout>
  );
};

export default Login;
