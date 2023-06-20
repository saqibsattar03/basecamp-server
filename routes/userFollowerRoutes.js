import express from 'express'
import {
  createNewUserFollower,
  getAllUserFollowers,
  deleteUserFollower,
  getUserFollowerById,
  updateUserFollower,
  getSortedUserFollowers,
  getCurrentUserFollowersAndFollowings,
  checkUserFollowerExist,
  getUserFollowingsById
} from '../controllers/userFollowerController.js'
import protect from '../middleware/authMiddleware.js'
const router = express.Router()

// router.route("/").post(protect, createNewUserFollower);
router.route('/').post(createNewUserFollower)

router
  .route('/follower-following/:id')
  .get(protect, getCurrentUserFollowersAndFollowings)

router.route('/all').get(protect, getAllUserFollowers)

router
  .route('/sorted/:filterKey/:direction/:numPerPage/:pageNum')
  .get(protect, getSortedUserFollowers)

// router.route("/:id").get(protect, getUserFollowerById);
router.route('/follower').get(getUserFollowerById)

// router.route("/:id").get(protect, getUserFollowerById);
router.route('/following').get(getUserFollowingsById)

router.route('/:id').put(protect, updateUserFollower)

router.route('/:id').delete(protect, deleteUserFollower)

router.route('/follow-unfollow').post(protect, checkUserFollowerExist)

export default router
