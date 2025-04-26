import { useState } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Badge,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';

// Sample notification data
const sampleNotifications = [
  {
    id: 1,
    type: 'success',
    message: 'Your Twitter content has been generated successfully',
    time: '5 minutes ago',
    read: false
  },
  {
    id: 2,
    type: 'info',
    message: 'New feature: You can now edit generated content',
    time: '2 hours ago',
    read: false
  },
  {
    id: 3,
    type: 'warning',
    message: 'Your LinkedIn content generation is taking longer than expected',
    time: '1 day ago',
    read: true
  }
];

const NotificationsMenu = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState(sampleNotifications);
  
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };
  
  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };
  
  const getNotificationIcon = (type: string, read: boolean) => {
    const color = read ? 'text.secondary' : 
      type === 'success' ? 'success.main' : 
      type === 'warning' ? 'warning.main' : 'info.main';
      
    return type === 'success' ? <CheckCircleIcon color="inherit" sx={{ color }} /> :
           type === 'warning' ? <WarningIcon color="inherit" sx={{ color }} /> :
           <InfoIcon color="inherit" sx={{ color }} />;
  };
  
  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleOpen}
          sx={{
            ml: 1,
            color: theme.palette.mode === 'light' ? theme.palette.text.primary : 'inherit',
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 320,
            maxHeight: 400,
            overflow: 'auto',
            borderRadius: 2,
            mt: 1.5,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              borderRadius: 1,
              my: 0.5,
              mx: 1,
              width: 'calc(100% - 16px)',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton size="small" onClick={handleMarkAllAsRead}>
                <DoneAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem 
              key={notification.id} 
              onClick={() => handleMarkAsRead(notification.id)}
              sx={{
                bgcolor: notification.read ? 'transparent' : 
                  theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.04)',
              }}
            >
              <ListItemIcon>
                {getNotificationIcon(notification.type, notification.read)}
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                    {notification.message}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {notification.time}
                  </Typography>
                }
              />
              <Tooltip title="Delete">
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationsMenu;
