const express = require('express');
const { getUsers, updateUser, deleteUser } = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleWare');
const router = express.Router();

router.get('/', authenticateToken, getUsers);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, deleteUser);

module.exports = router;
