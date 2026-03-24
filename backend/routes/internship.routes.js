const express = require('express');
const router = express.Router();
const {
    createInternship,
    getInternships,
    getInternshipById,
    updateInternship,
    deleteInternship
} = require('../controllers/internship.controller');
const { auth, authorize } = require('../middleware/auth.middleware');

router.post('/', auth, authorize(['faculty', 'admin']), createInternship);
router.get('/', getInternships);  // Public - anyone can browse
router.get('/:id', getInternshipById);  // Public - anyone can view details
router.put('/:id', auth, authorize(['faculty', 'admin']), updateInternship);
router.delete('/:id', auth, authorize(['faculty', 'admin']), deleteInternship);

module.exports = router;
