import express from 'express';
// Router
import user from './user.route';
import users from './users.route';
import subscribe from './subscribe.route';
import auth from './auth.route';
import posts from './post.route';
import notification from './notification.route';
import config from './../../config/config';

const router = express.Router();

router.use(express.static('public'));
/* GET localhost:[port]/api page. */
router.get('/', (req, res) => {
  res.send(`此路徑是: localhost:${config.port}/api`);
});

/** User Router */
router.use('/user', user);
/** Users Router */
router.use('/users', users);
/** auth Router */
router.use('/auth', auth);
/** posts Router */
router.use('/posts', posts);
/** Subscribe Router */
router.use('/subscribe', subscribe);

router.use('/notification', notification);

export default router;
