import { useState, useEffect } from 'react';
import { Menu, MenuItem, IconButton, Badge, Typography, Box, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import api from '../services/api';

const NotificationsMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('notifications/');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    // تحديث كل 30 ثانية
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.post(`notifications/${id}/read/`);
      fetchNotifications(); // تحديث القائمة
    } catch (e) {}
  };

  return (
    <>
      <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontSize="1rem">الإشعارات</Typography>
        </Box>
        <Divider />
        
        {notifications.length === 0 ? (
          <MenuItem disabled>لا توجد إشعارات جديدة</MenuItem>
        ) : (
          notifications.map((notif) => (
            <MenuItem 
              key={notif.id} 
              onClick={() => handleMarkRead(notif.id)}
              sx={{ 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                bgcolor: notif.is_read ? 'transparent' : 'action.hover' 
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                {notif.title}
                {!notif.is_read && <Box component="span" sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%', display: 'inline-block', ml: 1 }} />}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notif.message}
              </Typography>
              <Typography variant="caption" sx={{ mt: 0.5, color: 'text.disabled' }}>
                {new Date(notif.created_at).toLocaleDateString('ar-EG')}
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationsMenu;