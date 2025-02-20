import React, { useState, useEffect, useContext } from 'react';
import { Drawer, List, ListItem, ListItemText, IconButton, Typography, Box, Badge, Button, useTheme, useMediaQuery } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useSelector } from 'react-redux';
import { styled } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';
import { LanguageContext, messages } from 'components/LanguageContext';

const NotificationDrawer = () => {
  const {currentLanguage} = useContext(LanguageContext);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const user = useSelector((state) => state.user)
  const userId = `${user.user_id}`
  const { palette } = useTheme()
  const dark = palette.neutral.dark
  const [notifications, setNotifications] = useState([]);

  const isNonMobileScreens = useMediaQuery('(min-width: 1000px)')
  const notificationTypes = {
    1: messages[currentLanguage]?.post_liked,
    2: messages[currentLanguage]?.virus_made,
    3: messages[currentLanguage]?.comment_liked,
    4: messages[currentLanguage]?.post_traded
  };

  const StyledDrawer = styled(Drawer)(({ theme }) => ({
    '& .MuiDrawer-paper': {
      width: isNonMobileScreens ? '25%' : '100%',  // 占網頁的1/4
      backgroundColor: { dark },
      padding: theme.spacing(2),
      boxSizing: 'border-box',
    },
  }));

  const NotificationItem = styled(ListItem)(({ theme, isRead }) => ({
    margin: '10px 0',
    padding: '10px',
    // backgroundColor: isRead ? {dark} : '#00D5FA',
    backgroundColor: { dark },
    borderRadius: '5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }));

  const Dot = styled('div')({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#00D5FA',
    marginLeft: '10px',
  });

  const toggleDrawer = (open) => () => {
    setOpen(open);
    if (open) {
      handleNotificationClick();
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/notification/getUserNotifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });
      const results = await response.json();
      setNotifications(results);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = () => {
    if (!open) {
      setOpen(true);
      fetchNotifications();
    } else {
      setOpen(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);
  
  const handleReadClick = (userId, nid) => {
    const markNotificationAsRead = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/notification/userReadNotification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            nid: nid,
          }),
        });

        if (response.ok) {
          // 更新通知列表，將對應的通知標記為已讀
          if (nid > 0)
          {
              setNotifications(prevNotifications =>
                prevNotifications.map(notification =>
                  notification.nid === nid ? { ...notification, is_read: 1 } : notification
                )
              );
          }
          else
          {
              setNotifications(prevNotifications =>
                prevNotifications.map(notification => ({ ...notification, is_read: 1 }))
              );
          }
        } else {
          console.error('Failed to mark notification as read');
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    };
    markNotificationAsRead();
  };

  const filteredNotifications = filter === 'all' ? notifications : notifications.filter(notification => notification.is_read === 0);
  const unreadCount = notifications.filter(notification => notification.is_read === 0).length;

  return (
    <div>
      <Badge badgeContent={unreadCount} color="secondary">
        <IconButton onClick={toggleDrawer(true)}>
          <NotificationsIcon />
        </IconButton>
      </Badge>
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
        <Box display="flex" justifyContent="space-around" mb={2}>
          <Button variant="contained" onClick={() => setFilter('all')}>{messages[currentLanguage]?.all}</Button>
          <Button variant="contained" onClick={() => setFilter('unread')}>{messages[currentLanguage]?.unread}</Button>
          <Button variant="contained" onClick={() => handleReadClick(userId, 0)}>{messages[currentLanguage]?.read_all}</Button>
        </Box>
        <List>
          {filteredNotifications.length == 0 ? (
            <NotificationItem button key='0' isRead={false}>
              <ListItemText
                primary={
                  <Typography variant="body1">
                    目前尚無通知
                  </Typography>
                }
              />
            </NotificationItem>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem button key={notification.nid} isRead={notification.is_read === 1}
                onClick={() => handleReadClick(userId, notification.nid)}
              >
                <ListItemText
                  primary={
                    <Typography variant="body1">
                      {notificationTypes[notification.type]}
                    </Typography>
                  }
                  secondary={
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2">
                        {notification.content}
                      </Typography>
                      {notification.is_read === 0 && <Dot />}
                    </Box>
                  }
                />
                <Typography variant="caption" color="textSecondary">
                  {new Date(notification.create_time).toLocaleString()}
                </Typography>
              </NotificationItem>
            ))
          )}
        </List>
      </StyledDrawer>
    </div>
  );
};

export default NotificationDrawer;
