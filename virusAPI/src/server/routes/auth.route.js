import express from "express";
import multer from "multer";
import { userLogin, userAdd} from "../modules/auth.moudule.js";

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

router.post("/login", userLogin);
router.post("/register",upload.single("picture"), userAdd);

export default router;
