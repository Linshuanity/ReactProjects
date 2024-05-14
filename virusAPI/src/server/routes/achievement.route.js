import express from 'express';
import multer from 'multer';
import {
  getAchievement,
} from '../modules/achievement.module.js';

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

router.post('/fetch', getAchievement);

export default router;
