import express from 'express';
import validate from 'express-validation';
import usersCtrl from '../controllers/users.controller';
import paramValidation from '../../config/param-validation';
import { verifyToken } from '../../middleware/auth.js';

const router = express.Router();

router
  .route('/')
  .get(usersCtrl.userGet) /** 取得 User 所有值組 */
  .post(
    validate(paramValidation.createUser),
    usersCtrl.userPost,
  ); /** 新增 User 值組 */

router.route('/description').post(usersCtrl.userUpdate);

router
  .route('/:user_id')
  .get(usersCtrl.userGetById) /** 取得 User 所有值組 */
  .put(usersCtrl.userPut) /** 修改 User 值組 */
  .delete(usersCtrl.userDelete); /** 刪除 User 值組 */

// /* READ */
// router.get("/:id", verifyToken, getUser);
// router.get("/:id/friends", verifyToken, getUserFriends);

// /* UPDATE */
// router.patch("/:id/:friendId", verifyToken, addRemoveFriend);

export default router;
