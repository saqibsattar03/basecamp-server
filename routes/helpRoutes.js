import express from 'express'
const router = express.Router()
import {
  createNewHelp,
  getAllHelp,
  deleteHelp,
  getHelpById,
  updateHelp,
  getSortedHelp,
} from '../controllers/helpController.js'
import protect from '../middleware/authMiddleware.js'

router.route('/')
  .post(protect, createNewHelp)
router.route('/all/:pageNum')
  .get(protect, getAllHelp)
router.route('/sorted/:filterKey/:direction/:numPerPage/:pageNum')
    .get(protect, getSortedHelp)
router.route('/:id')
  .get(protect, getHelpById)
router.route('/:id')
  .put(protect, updateHelp)
router.route('/:id')
  .delete(protect, deleteHelp)

export default router