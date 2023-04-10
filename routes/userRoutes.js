import express from 'express'
const router = express.Router()
import {
  createNewUser,
  getAllUsers,
  deleteUser,
  getUserById,
  updateUser,
  getSortedUsers,
} from '../controllers/userController.js'
import protect from '../middleware/authMiddleware.js'

router.route('/')
  .post(protect, createNewUser)
router.route('/all/:pageNum')
  .get(protect, getAllUsers)
router.route('/sorted/:filterKey/:direction/:numPerPage/:pageNum')
    .get(protect, getSortedUsers)
router.route('/:id')
  .get(protect, getUserById)
router.route('/:id')
  .put(protect, updateUser)
router.route('/:id')
  .delete(protect, deleteUser)

export default router