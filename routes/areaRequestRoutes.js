const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const controller = require('../controllers/areaRequestController');

router.post('/request-add', authMiddleware, controller.requestAddToArea);
router.get('/', authMiddleware, controller.getMyAreaRequests);
router.post('/:id/approve', authMiddleware, controller.approveAreaRequest);
router.post('/:id/reject', authMiddleware, controller.rejectAreaRequest);

module.exports = router;
