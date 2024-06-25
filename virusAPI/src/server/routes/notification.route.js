import express from 'express';
import {
  userNotifications,
  userReadNotification,
  insertNotification 
} from '../modules/notification.module.js';

const router = express.Router();

router.post('/getUserNotifications', userNotifications);
router.post('/userReadNotification', userReadNotification);
router.post('/:user_id', userNotifications);
router.get('/:user_id', userNotifications);
router.post('/insert', insertNotification);

export default router;
