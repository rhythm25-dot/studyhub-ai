const express = require('express');
const router = express.Router();

const noteController = require('../controllers/noteController');
const protect = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { createNoteValidator, updateNoteValidator } = require('../validators/noteValidators');

router.use(protect);

router.post('/', roleGuard('teacher'), upload.single('file'), createNoteValidator, validate, noteController.uploadNote);
router.get('/', noteController.getNotes);
router.get('/bookmarks/mine', roleGuard('student'), noteController.getMyBookmarks);
router.get('/:id', noteController.getNoteById);
router.patch('/:id', roleGuard('teacher'), updateNoteValidator, validate, noteController.updateNote);
router.delete('/:id', roleGuard('teacher'), noteController.deleteNote);

router.post('/:id/bookmark', roleGuard('student'), noteController.bookmarkNote);
router.delete('/:id/bookmark', roleGuard('student'), noteController.removeBookmark);

module.exports = router;
