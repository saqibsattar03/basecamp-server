import express from 'express'
const router = express.Router()
import {
  createNewUserFollower,
  getAllUserFollowers,
  deleteUserFollower,
  getUserFollowerById,
  updateUserFollower,
  getSortedUserFollowers,
} from '../controllers/userFollowerController.js'
import protect from '../middleware/authMiddleware.js'

router.route('/')
  .post(protect, createNewUserFollower)
router.route('/all/:pageNum')
  .get(protect, getAllUserFollowers)
router.route('/sorted/:filterKey/:direction/:numPerPage/:pageNum')
    .get(protect, getSortedUserFollowers)
router.route('/:id')
  .get(protect, getUserFollowerById)
router.route('/:id')
  .put(protect, updateUserFollower)
router.route('/:id')
  .delete(protect, deleteUserFollower)

export default router