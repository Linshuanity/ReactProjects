import express from 'express';
import {
  userNotifications
} from '../modules/notification.module.js';

const router = express.Router();

router.post('/getUserNotifications', userNotifications);
router.post('/:user_id', userNotifications);
router.get('/:user_id', userNotifications);

export default router;
