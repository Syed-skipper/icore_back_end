const express = require('express');
const multer = require('multer');
const { uploadUsers, exportUsers } = require('../controllers/fileController');
const authenticateToken = require('../middleware/authMiddleWare');
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

router.post('/upload-users', authenticateToken, upload.single('file'), uploadUsers);
router.get('/export-users', authenticateToken, exportUsers);

module.exports = router;
