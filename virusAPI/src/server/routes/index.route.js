import express from 'express';
// Router
import article from './article.route';
import user from './user.route';
import users from './users.route';
import subscribe from './subscribe.route';
import auth from './auth.route';
import path from 'path';
import config from './../../config/config';

const router = express.Router();

router.use(express.static('public'));

/* GET localhost:[port]/api page. */
router.get('/', (req, res) => {
  res.send(`此路徑是: localhost:${config.port}/api`);
});

/** Article Router */
router.use('/article', article);
/** User Router */
router.use('/user', user);
/** Users Router */
router.use('/users', users);
/** auth Router */
router.use('/auth', auth);
/** Subscribe Router */
router.use('/subscribe', subscribe);


export default router;
