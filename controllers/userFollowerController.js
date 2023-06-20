import asyncHandler from "express-async-handler";
import UserFollower from "../models/userFollowerModel.js";
import AppError from "../utilis/appError.js";

// ******** CREATE ********

// @desc    Create a new UserFollower
// @route   POST /api/user-followers
// @access  Private

const createNewUserFollower = asyncHandler(async (req, res) => {
  const alreadyFollowed = await UserFollower.findOne({
    follower: req.body.follower,
    following: req.body.following,
  });
  if (alreadyFollowed) {
    await UserFollower.findOneAndDelete({
      follower: req.body.follower,
      following: req.body.following,
    });
    res.status(201).send("User Unfollowed Successfully.");
  } else {
    const userFollower = await UserFollower.create(req.body);
    if (userFollower) {
      res.status(201).json(userFollower);
    } else {
      res.status(400);
      throw new Error("Invalid UserFollower data");
    }
  }
});

// const createNewUserFollower = asyncHandler(async (req, res) => {
//   const userFollower = await UserFollower.create(req.body);
//   if (userFollower) {
//     res.status(201).json(userFollower);
//   } else {
//     res.status(400);
//     throw new Error("Invalid UserFollower data");
//   }
// });

// ******** READ ********

// @desc    Get all UserFollowers
// @route   GET /api/user-followers?page=10
// @access  Private/Admin
const getAllUserFollowers = asyncHandler(async (req, res) => {
  const resultsPerPage = 50;
  const page = req.params.page;
  const userFollowerCount = await UserFollower.countDocuments({});

  const pagination = {
    totalCount: userFollowerCount,
    currentPage: page,
  };

  const userFollowers = await UserFollower.find({})
    .sort({ createdAt: "asc" })
    .limit(resultsPerPage)
    .skip(resultsPerPage > 0 ? resultsPerPage * (page - 1) : 0);

  res.status(200).json({ userFollowers, pagination });
});

// @desc    Get sorted UserFollowers
// @route   GET /api/user-followers/sorted/:filterKey/:direction/:numPerPage/:pageNum
// @access  Private/Admin
const getSortedUserFollowers = asyncHandler(async (req, res) => {
  const pageNum = req.params.pageNum || 0;
  const filterKey = req.params.filterKey || "createdAt";
  const direction = req.params.direction || "asc";
  const numPerPage = req.params.numPerPage || 25;
  const userFollowerCount = await UserFollower.countDocuments({});

  const sortQuery = {};
  sortQuery[filterKey] = direction;

  const pagination = {
    totalCount: userFollowerCount,
    currentPage: pageNum,
  };

  const userFollowers = await UserFollower.find({})
    .sort(filterKey)
    .limit(numPerPage)
    .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0);

  res.status(200).json({ userFollowers, pagination });
});

// @desc    Get UserFollower by ID
// @route   GET /user-followers/:id
// @access  Private
const getUserFollowerById = asyncHandler(async (req, res) => {
  const numPerPage = req.query.numPerPage || 40;
  const page = req.query.pageNum;
  console.log("query :: ", req.query);

  const userFollowerCount = await UserFollower.find({
    following: req.query.id,
  }).countDocuments({});
  const pagination = {
    totalCount: userFollowerCount,
    currentPage: page,
  };

  const followers = await UserFollower.find({ following: req.query.id })
    .populate("follower")
    .limit(numPerPage)
    .skip(numPerPage > 0 ? numPerPage * (page - 1) : 0);
  console.log("followers :: ", followers);

  res.status(200).json({ followers, pagination });
});

// @desc    Get UserFollowings by ID
// @route   GET /user-followings/:id
// @access  Private
const getUserFollowingsById = asyncHandler(async (req, res) => {
  const numPerPage = req.query.numPerPage || 40;
  const page = req.query.pageNum;

  const userFollowerCount = await UserFollower.find({
    follower: req.query.id,
  }).countDocuments({});
  const pagination = {
    totalCount: userFollowerCount,
    currentPage: page,
  };

  const followings = await UserFollower.find({ follower: req.query.id })
    .populate("following")
    .limit(numPerPage)
    .skip(numPerPage > 0 ? numPerPage * (page - 1) : 0);
  res.status(200).json({ followings, pagination });
});

// ******** UPDATE ********

// @desc    Update UserFollower
// @route   PUT /api/user-followers/:id
// @access  Private
const updateUserFollower = asyncHandler(async (req, res, next) => {
  const userFollower = await UserFollower.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  // If we don't find the user, throw an error.
  if (!userFollower) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json(userFollower);
});

// ******** DELETE ********

// @desc    Delete UserFollower
// @route   DELETE /api/user-followers/:id
// @access  Private
const deleteUserFollower = asyncHandler(async (req, res, next) => {
  const userFollower = await UserFollower.findByIdAndDelete(req.params.id);

  if (!userFollower) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({ message: "UserFollower removed" });
});

// ***** one user followers and followings*******
const getCurrentUserFollowersAndFollowings = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  // const followerCount = await UserFollower.countDocuments({
  //   following: userId,
  // });
  const followerCount = await UserFollower.find({
    following: userId,
  }).countDocuments({});
  // const followingCount = await UserFollower.countDocuments({
  //   follower: userId,
  // });
  const followingCount = await UserFollower.find({
    follower: userId,
  }).countDocuments({});

  res.status(200).json({ followerCount, followingCount });
});
//* *********** follow unfollow */

// const followUnfollowUser = asyncHandler(async (req, res) => {
//   const { follower, following } = req.body;

//   const existingUserFollower = await UserFollower.findOneAndDelete({
//     follower,
//     following,
//   });

//   if (existingUserFollower) {
//     console.log("Deleted existing user follower:", existingUserFollower);
//   }

//   const newUserFollower = await UserFollower.create(req.body);

//   if (newUserFollower) {
//     res.status(201).json(newUserFollower);
//   } else {
//     res.status(400);
//     throw new Error("Invalid UserFollower data");
//   }
// });
//* *** check userfollower exist */

const checkUserFollowerExist = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { follower, following } = req.body;
  const documentExists = await UserFollower.exists({
    follower,
    following,
  });

  res.status(200).json({ exist: !!documentExists });
});

/// //////////////////////////////////////////////////
export {
  createNewUserFollower,
  getUserFollowerById,
  getAllUserFollowers,
  getSortedUserFollowers,
  updateUserFollower,
  deleteUserFollower,
  getCurrentUserFollowersAndFollowings,
  getUserFollowingsById,
  //  followUnfollowUser,
  checkUserFollowerExist,
};
