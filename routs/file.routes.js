const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileController = require('../controllers/file.contoller');
const authenticateToken = require('../middlewares/authenticateToken');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + fileExtension;
    cb(null, filename);
  },
});

const upload = multer({ storage });

router.post('/upload', authenticateToken, upload.single('file'), fileController.uploadFile);

router.get('/list', authenticateToken, fileController.getFileList);

router.delete('/delete/:id', authenticateToken, fileController.deleteFile);

module.exports = router;
