import express from 'express';
import multer from 'multer';
import {
  userPosts,
  getPost,
  userLike,
  commentlike,
  userBid,
  userBids,
  userPurchase,
  userRefuel,
  userComment,
  userComments,
  createUserPost,
} from '../modules/post.module.js';

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

const router = express.Router();

router.post('/all', userPosts);
router.post('/like', userLike);
router.post('/commentlike', commentlike);
router.post('/bid', userBid);
router.post('/bids', userBids);
router.post('/purchase', userPurchase);
router.post('/refuel', userRefuel);
router.post('/comment', userComment);
router.post('/comments', userComments);
router.post('/createPost', upload.single('picture'), createUserPost);
router.post('/:post_id', getPost);

export default router;
