import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemText, IconButton, Typography, Box, useTheme } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useSelector } from 'react-redux';
import { styled } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';

const NotificationDrawer = () => {
  const [open, setOpen] = useState(false);
  const user = useSelector((state) => state.user)
  const userId = `${user.user_id}`
  const { palette } = useTheme()
  const dark = palette.neutral.dark


  
const notificationTypes = {
    1: "貼文被讚",
    2: "評論被讚",
    3: "獲得金錢",
    4: "交易成功"
};

const StyledDrawer = styled(Drawer)(({ theme }) => ({
    '& .MuiDrawer-paper': {
      width: '33%',  // 占網頁的1/3寬度
      backgroundColor: {dark},
      padding: theme.spacing(2),
      boxSizing: 'border-box',
    },
  }));
  
const NotificationItem = styled(ListItem)(({ theme }) => ({
    margin: '10px 0',
    padding: '10px',
    margin: '3px',
    backgroundColor: '#00D5FA',
    borderRadius: '5px',
}));

  const toggleDrawer = (open) => () => {
    setOpen(open);
    if (open) {
      handleNotificationClick();
    }
  };

  const [notifications, setNotifications] = useState([]);
  
  const handleNotificationClick = () => {
    setOpen(true);
      const fetchNotifications = async () => {
          const response = await fetch(`http://localhost:3002/notification/getUserNotifications`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  user_id: userId,
              }),
          })
          console.log(userId);
          const results = await response.json()
          setNotifications(results)
      }
    fetchNotifications();
  };

  return (
    <div>
      <IconButton onClick={toggleDrawer(true)}>
        <NotificationsIcon />
      </IconButton>
      <StyledDrawer
        anchor='right'
        open={open}
        onClose={toggleDrawer(false)}
        ModalProps={{
          keepMounted: true, // 更改這個屬性來避免反灰
        }}
        BackdropProps={{
          invisible: true, // 使Backdrop不可見
        }}
      >
        <Box display="flex" justifyContent="flex-end">
          <IconButton onClick={toggleDrawer(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
          <List>
            {notifications.map((notification) => (
              <NotificationItem button key={notification.nid}>
                <ListItemText
                  primary={
                    <Typography variant="body1">
                      {notificationTypes[notification.type]}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2">
                      {notification.content}
                    </Typography>
                  }
                />
              </NotificationItem>
            ))}
          </List>
      </StyledDrawer>
    </div>
  );
};

export default NotificationDrawer;
