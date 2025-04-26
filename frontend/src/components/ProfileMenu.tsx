import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';

interface ProfileMenuProps {
  onLogout: () => void;
}

const ProfileMenu = ({ onLogout }: ProfileMenuProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Get user info from localStorage or use default
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
  const userInitial = userName.charAt(0).toUpperCase();
  
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleClose();
    onLogout();
  };
  
  const handleProfile = () => {
    handleClose();
    // Navigate to profile page (not implemented yet)
    // navigate('/profile');
    alert('Profile page not implemented yet');
  };
  
  const handleSettings = () => {
    handleClose();
    // Navigate to settings page (not implemented yet)
    // navigate('/settings');
    alert('Settings page not implemented yet');
  };
  
  return (
    <>
      <Tooltip title="Profile">
        <Avatar
          onClick={handleOpen}
          sx={{
            ml: 2,
            cursor: 'pointer',
            bgcolor: theme.palette.primary.main,
            color: '#ffffff',
            transition: theme.transitions.create('transform', {
              duration: theme.transitions.duration.shorter,
            }),
            '&:hover': {
              transform: 'scale(1.1)',
            },
          }}
        >
          {userInitial}
        </Avatar>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 220,
            overflow: 'visible',
            borderRadius: 2,
            mt: 1.5,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              borderRadius: 1,
              my: 0.5,
              mx: 1,
              width: 'calc(100% - 16px)',
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfile} sx={{ mb: 1 }}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary={userName}
            secondary={userEmail}
            primaryTypographyProps={{ variant: 'subtitle2' }}
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="My Profile" />
        </MenuItem>
        
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={handleLogout}
          sx={{ 
            color: theme.palette.error.main,
            '& .MuiListItemIcon-root': {
              color: theme.palette.error.main,
            }
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;
