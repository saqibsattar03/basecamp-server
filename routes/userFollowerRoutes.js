import express from "express";
const router = express.Router();
import {
  createNewUserFollower,
  getAllUserFollowers,
  deleteUserFollower,
  getUserFollowerById,
  updateUserFollower,
  getSortedUserFollowers,
  getCurrentUserFollowersAndFollowings,
  // followUnfollowUser,
  checkUserFollowerExist,
} from "../controllers/userFollowerController.js";
import protect from "../middleware/authMiddleware.js";

router.route("/").post(protect, createNewUserFollower);
router
  .route("/follower-following/:id")
  .get(protect, getCurrentUserFollowersAndFollowings);
router.route("/all").get(protect, getAllUserFollowers);
router
  .route("/sorted/:filterKey/:direction/:numPerPage/:pageNum")
  .get(protect, getSortedUserFollowers);
router.route("/:id").get(protect, getUserFollowerById);
router.route("/:id").put(protect, updateUserFollower);
router.route("/:id").delete(protect, deleteUserFollower);
// router.route("/follow-unfollow").post(protect, followUnfollowUser);
router.route("/follow-unfollow").post(protect, checkUserFollowerExist);

export default router;
