import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import AppError from "../utilis/appError.js";
import jwt from "jsonwebtoken";

// ******** Login ********

// @desc    Login from user
// @route   POST /api/users/login
// @access  Public

const login = asyncHandler(async (req, res, next) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("Invalid credentials", 401));
    }

    email = email.toString().toLowerCase();

    const user = await User.findOne({
      $or: [{ email: email }, { username: email }],
    });
    if (!user) return next(new AppError("User not found", 400));

    let id = user?._id;

    const passwordMatch = await user.matchPassword(password);

    if (passwordMatch && user) {
      const token = jwt.sign({ email, id }, process.env.JWT_SECRET);
      res.status(200).json({ user: user, token });
    } else {
      return next(new AppError("Invalid credentials", 401));
    }
  } catch (e) {
    next(e);
  }
});

// ******** CREATE ********

// @desc    Create a new user
// @route   POST /api/users
// @access  Private
const createNewUser = asyncHandler(async (req, res, next) => {
  let { username, email, password } = req.body;
  username = username.toString().toLowerCase();
  email = email.toString().toLowerCase();
  if (await User.findOne({ $or: [{ username: username }, { email: email }] })) {
    return next(
      new AppError("User with this email/username already exists!", 409)
    );
  }

  const user = await User.create(req.body);

  if (user) {
    res.status(201).json({ user: user });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// ******** READ ********

// @desc    Get all users
// @route   GET /api/users/:page
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const resultsPerPage = 50;
  const page = req.params.page || 0;
  const userCount = await User.countDocuments({});

  const pagination = {
    totalCount: userCount,
    currentPage: page,
  };

  const users = await User.find({})
    .sort({ createdAt: "asc" })
    .limit(resultsPerPage)
    .skip(resultsPerPage > 0 ? resultsPerPage * (page - 1) : 0);

  res.status(200).json({ users, pagination });
});

// @desc    Get sorted users
// @route   GET /api/users/sorted/:filterKey/:direction/:numPerPage/:pageNum
// @access  Private/Admin
const getSortedUsers = asyncHandler(async (req, res) => {
  const pageNum = req.params.pageNum || 0;
  const filterKey = req.params.filterKey || "createdAt";
  const direction = req.params.direction || "asc";
  const numPerPage = req.params.numPerPage || 25;
  const userCount = await User.countDocuments({});

  let sortQuery = {};
  sortQuery[filterKey] = direction; // ex { title: "asc" }

  const pagination = {
    totalCount: userCount,
    currentPage: pageNum,
  };

  const users = await User.find({})
    .sort(filterKey)
    .limit(numPerPage)
    .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0);

  res.status(200).json({ users, pagination });
});

// @desc    Get user by ID
// @route   GET /api/users/get_user/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  res.status(200).json(user);
});

// ******** UPDATE ********

// @desc    Update user user
// @route   PUT /api/users/update_user/:id
// @access  Private
const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  // If we don't find the user, throw an error.
  if (!user) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json(user);
});

// ******** DELETE ********

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({ message: "User removed" });
});

export {
  createNewUser,
  getUserById,
  getAllUsers,
  getSortedUsers,
  updateUser,
  deleteUser,
  login,
};
