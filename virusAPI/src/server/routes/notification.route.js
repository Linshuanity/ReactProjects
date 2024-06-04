import express from 'express';
import {
  userNotifications,
  userReadNotification
} from '../modules/notification.module.js';

const router = express.Router();

router.post('/getUserNotifications', userNotifications);
router.post('/userReadNotification', userReadNotification);
router.post('/:user_id', userNotifications);
router.get('/:user_id', userNotifications);

export default router;
