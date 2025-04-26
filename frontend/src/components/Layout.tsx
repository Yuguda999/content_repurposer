import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  History as HistoryIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import ThemeToggle from './ThemeToggle';
import NotificationsMenu from './NotificationsMenu';
import ProfileMenu from './ProfileMenu';
import Logo from './Logo';
import { motion } from 'framer-motion';

const Layout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Close drawer when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');

    setIsAuthenticated(false);
    navigate('/login');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'New Content', icon: <AddIcon />, path: '/new' },
    { text: 'Job History', icon: <HistoryIcon />, path: '/jobs' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: 'blur(10px)',
          backgroundColor: theme.palette.mode === 'light'
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(15, 23, 42, 0.9)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create(['background-color', 'box-shadow'], {
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        <Toolbar>
          {isAuthenticated && (
            <IconButton
              size="large"
              edge="start"
              aria-label="menu"
              sx={{
                mr: 2,
                color: theme.palette.mode === 'light' ? theme.palette.text.primary : 'inherit',
                transition: theme.transitions.create('transform', {
                  duration: theme.transitions.duration.shorter,
                }),
                '&:hover': {
                  transform: 'rotate(180deg)',
                },
              }}
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            <Logo />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ThemeToggle />

            {isAuthenticated && (
              <>
                <NotificationsMenu />
                <ProfileMenu onLogout={handleLogout} />
              </>
            )}

            {!isAuthenticated && (
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{
                  borderRadius: '20px',
                  px: 2,
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {isAuthenticated && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
          PaperProps={{
            sx: {
              width: 280,
              borderRadius: '0 16px 16px 0',
              boxShadow: theme.shadows[8],
            }
          }}
        >
          <Box
            sx={{
              width: 280,
              pt: 2,
              pb: 2,
            }}
            role="presentation"
          >
            <Box sx={{ p: 2, mb: 2 }}>
              <Logo variant="sidebar" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 1 }}>
                Transform your content for any platform
              </Typography>
            </Box>

            <Divider />

            <List sx={{ px: 1 }}>
              {menuItems.map((item, index) => (
                <ListItem
                  button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: '12px',
                    mb: 0.5,
                    transition: theme.transitions.create(['background-color', 'color'], {
                      duration: theme.transitions.duration.shorter,
                    }),
                    '&.Mui-selected': {
                      bgcolor: theme.palette.mode === 'dark'
                        ? 'rgba(144, 202, 249, 0.16)'
                        : 'rgba(25, 118, 210, 0.08)',
                      color: theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark'
                          ? 'rgba(144, 202, 249, 0.24)'
                          : 'rgba(25, 118, 210, 0.12)',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path
                        ? theme.palette.primary.main
                        : theme.palette.mode === 'light'
                          ? theme.palette.text.primary
                          : 'inherit',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: location.pathname === item.path ? 600 : 500,
                      color: theme.palette.mode === 'light'
                        ? theme.palette.text.primary
                        : 'inherit',
                    }}
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <List sx={{ px: 1 }}>
              <ListItem
                button
                onClick={handleLogout}
                sx={{
                  borderRadius: '12px',
                  color: theme.palette.error.main,
                  transition: theme.transitions.create('background-color', {
                    duration: theme.transitions.duration.shorter,
                  }),
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark'
                      ? 'rgba(244, 67, 54, 0.08)'
                      : 'rgba(244, 67, 54, 0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.error.main, minWidth: 40 }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </List>
          </Box>
        </Drawer>
      )}

      <Container
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
          px: { xs: 2, sm: 3, md: 4 },
          maxWidth: { xl: '1400px' },
        }}
      >
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          mt: 'auto',
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.mode === 'light'
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
            <Logo variant="footer" showText={false} />
          </Box>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Content Repurposer. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
