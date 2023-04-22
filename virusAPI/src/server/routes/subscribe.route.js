import express from 'express';
import validate from 'express-validation';
import subscribeCtrl from '../controllers/subscribe.controller';
import paramValidation from '../../config/param-validation';

const router = express.Router();

router.route('/:subscriber_id/:subscribed_id')
  .get(subscribeCtrl.subscribeGet) /** 取得 User 所有值組 */

router.route('/:subscribed_id')
  .get(subscribeCtrl.getCountById); /** 取得 User 所有值組 */

router.route('/update')
  .post(validate(paramValidation.createSubscribe), subscribeCtrl.createSubscribe)
  .delete(validate(paramValidation.deleteSubscribe), subscribeCtrl.deleteSubscribe); /** 新增 User 值組 */

export default router;
