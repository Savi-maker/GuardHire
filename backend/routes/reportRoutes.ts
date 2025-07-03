import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getReportsByOrder, addReport, getReports } from '../controllers/reportController';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir;
    if (file.fieldname === 'photo') {
      dir = path.join(__dirname, '../uploads/images');
    } else if (file.fieldname === 'audioNote') {
      dir = path.join(__dirname, '../uploads/audio');
    } else {
      dir = path.join(__dirname, '../uploads');
    }
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ storage });

router.get('/all', getReports);
router.get('/', getReportsByOrder);
router.post('/',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'audioNote', maxCount: 1 }
  ]),
  addReport
);

export default router;
