import express from 'express'
import {
  createNewUser,
  getAllUsers,
  deleteUser,
  getUserById,
  updateUser,
  getSortedUsers,
  login, changePassword
} from '../controllers/userController.js'
import protect from '../middleware/authMiddleware.js'
const router = express.Router()

router.route('/login').post(login)
router.route('/').post(createNewUser)
router.route('/all/:pageNum').get(protect, getAllUsers)
router
  .route('/sorted/:filterKey/:direction/:numPerPage/:pageNum')
  .get(protect, getSortedUsers)
router.route('/:id').get(protect, getUserById)
router.route('/:id').patch(protect, updateUser)
router.route('/:id').delete(protect, deleteUser)
router.route('/change-password').post(protect, changePassword)


export default router
