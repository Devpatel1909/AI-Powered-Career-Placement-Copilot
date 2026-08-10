const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.post('/refresh', jobController.refreshJobs);
router.get('/stats', jobController.getJobStats);
router.get('/recommendations', jobController.getRecommendations);
router.post('/recommendations', jobController.postRecommendations);
router.post('/:id/explain', jobController.explainJob);

module.exports = router;
