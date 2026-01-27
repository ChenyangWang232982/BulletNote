const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getNoteByTitle
} = require('../controllers/noteController');

router.use(protect);
router.get('/', getNotes);
router.get('/title/:name', getNoteByTitle); 
router.post('/', createNote); 
router.put('/:id', updateNote); 
router.delete('/:id', deleteNote); 

module.exports = router;