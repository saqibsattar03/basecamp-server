import express from 'express'
const router = express.Router()
import {
  createNewMessageStat,
  getAllMessageStats,
  deleteMessageStat,
  getMessageStatById,
  updateMessageStat,
  getSortedMessageStats,
} from '../controllers/messageStatController.js'
import protect from '../middleware/authMiddleware.js'

router.route('/')
  .post(protect, createNewMessageStat)
router.route('/all/:pageNum')
  .get(protect, getAllMessageStats)
router.route('/sorted/:filterKey/:direction/:numPerPage/:pageNum')
    .get(protect, getSortedMessageStats)
router.route('/:id')
  .get(protect, getMessageStatById)
router.route('/:id')
  .put(protect, updateMessageStat)
router.route('/:id')
  .delete(protect, deleteMessageStat)

export default router