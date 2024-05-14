import React from 'react';
import { makeStyles } from '@mui/styles';
import { Card, CardContent, Typography } from '@mui/material';

const useStyles = makeStyles({
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    marginBottom: 16,
    padding: 16,
  },
  notificationContent: {
    display: 'flex',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: 16,
    fontSize: 24,
    color: '#4caf50',
  },
  notificationTitle: {
    fontWeight: 600,
    fontSize: 16,
  },
  notificationBody: {
    color: '#333',
  },
});

const Notification = ({ notification }) => {
  const classes = useStyles();

  return (
    <Card className={classes.notificationCard}>
      <CardContent className={classes.notificationContent}>
        {notification.type === 'info' && (
          <i className={`${classes.notificationIcon} fas fa-info-circle`} />
        )}
        {notification.type === 'warning' && (
          <i className={`${classes.notificationIcon} fas fa-exclamation-triangle`} />
        )}
        {notification.type === 'error' && (
          <i className={`${classes.notificationIcon} fas fa-times-circle`} />
        )}
        <div>
          <Typography className={classes.notificationTitle}>
            {notification.title}
          </Typography>
          <Typography className={classes.notificationBody}>
            {notification.content}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
};

export default Notification;
