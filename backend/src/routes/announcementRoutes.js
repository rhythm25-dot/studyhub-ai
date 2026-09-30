const express = require('express');
const router = express.Router();

const announcementController = require('../controllers/announcementController');
const protect = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { createAnnouncementValidator } = require('../validators/announcementValidators');

router.use(protect);

router.post('/', roleGuard('teacher', 'admin'), createAnnouncementValidator, validate, announcementController.createAnnouncement);
router.get('/', announcementController.getAnnouncements);
router.get('/:id', announcementController.getAnnouncementById);
router.delete('/:id', roleGuard('teacher', 'admin'), announcementController.deleteAnnouncement);

module.exports = router;
