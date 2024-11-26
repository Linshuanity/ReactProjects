import express from 'express';
// Router
import user from './user.route';
import users from './users.route';
import subscribe from './subscribe.route';
import auth from './auth.route';
import posts from './post.route';
import notification from './notification.route';
import achievement from './achievement.route';
import config from './../../config/config';

const router = express.Router();

// API 前綴，從環境變數讀取
const apiPrefix = process.env.API_PREFIX || '';
router.use(`${apiPrefix}/assets`, express.static('public/assets'));

/* GET localhost:[port]/api page. */
router.get('/', (req, res) => {
  const baseURL = `${window.location.origin}`; // 獲取目前網站的基礎 URL
  res.send(`此路徑是: ${baseURL}:${config.port}${apiPrefix}`);
});

/** User Router */
router.use(`${apiPrefix}/user`, user);
/** Users Router */
router.use(`${apiPrefix}/users`, users);
/** auth Router */
router.use(`${apiPrefix}/auth`, auth);
/** posts Router */
router.use(`${apiPrefix}/posts`, posts);
/** Subscribe Router */
router.use(`${apiPrefix}/subscribe`, subscribe);
/** Achievement Router */
router.use(`${apiPrefix}/achievement`, achievement);
/** Notification Router */
router.use(`${apiPrefix}/notification`, notification);

export default router;
