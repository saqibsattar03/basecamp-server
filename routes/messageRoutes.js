import express from 'express'
const router = express.Router()
import {
  createNewMessage,
  getAllMessages,
  deleteMessage,
  getMessageById,
  updateMessage,
  getSortedMessages,
} from '../controllers/messageController.js'
import protect from '../middleware/authMiddleware.js'

router.route('/')
  .post(protect, createNewMessage)
router.route('/all/:pageNum')
  .get(protect, getAllMessages)
router.route('/sorted/:filterKey/:direction/:numPerPage/:pageNum')
    .get(protect, getSortedMessages)
router.route('/:id')
  .get(protect, getMessageById)
router.route('/:id')
  .put(protect, updateMessage)
router.route('/:id')
  .delete(protect, deleteMessage)

export default router