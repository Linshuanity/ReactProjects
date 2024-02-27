import express from 'express';
import validate from 'express-validation';
import subscribeCtrl from '../controllers/subscribe.controller';
import paramValidation from '../../config/param-validation';

const router = express.Router();

router.route('/friends/:user_id')
  .get(subscribeCtrl.getFriends); /** 取得 User 所有值組 */

router.route('/search')
  .post(subscribeCtrl.getSearch);

router.route('/add/:subscriber_id/:subscribed_id')
  .patch(subscribeCtrl.createSubscribe)
router.route('/delete/:subscriber_id/:subscribed_id')
  .patch(validate(paramValidation.deleteSubscribe), subscribeCtrl.deleteSubscribe); /** 新增 User 值組 */

router.route('/:subscriber_id/:subscribed_id')
  .get(subscribeCtrl.subscribeGet) /** 取得 User 所有值組 */

export default router;
