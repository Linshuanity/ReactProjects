import express from "express";
import multer from "multer";
import { userPosts, userLike, userBid, userPurchase, userComment, userComments } from "../modules/post.module.js";

/* FILE STORAGE */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/assets");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
const upload = multer({ storage });

const router = express.Router();

router.post("/all", userPosts);
router.post("/like", userLike);
router.post("/bid", userBid);
router.post("/purchase", userPurchase);
router.post("/comment", userComment);
router.post("/comments", userComments);

export default router;
