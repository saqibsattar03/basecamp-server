import express from 'express'
const router = express.Router()
import {
  createNewGroup,
  getAllGroups,
  deleteGroup,
  getGroupById,
  updateGroup,
  getSortedGroups,
} from '../controllers/groupController.js'
import protect from '../middleware/authMiddleware.js'

router.route('/')
  .post(protect, createNewGroup)
router.route('/all/:pageNum')
  .get(protect, getAllGroups)
router.route('/sorted/:filterKey/:direction/:numPerPage/:pageNum')
    .get(protect, getSortedGroups)
router.route('/:id')
  .get(protect, getGroupById)
router.route('/:id')
  .put(protect, updateGroup)
router.route('/:id')
  .delete(protect, deleteGroup)

export default router