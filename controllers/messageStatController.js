import asyncHandler from "express-async-handler";
import MessageStat from "../models/messageStatModel.js";
import AppError from "../utilis/appError.js";
import Message from "../models/messageModel.js";

// ******** CREATE ********

// @desc    Create a new message-stats
// @route   POST /api/message-stats
// @access  Private
const createNewMessageStat = asyncHandler(async (req, res) => {
  const { message_id, user_id } = req.body;
  const { is_fav, is_liked, is_disliked } = req.body;
  console.log(message_id);
  console.log(user_id);

  let countField;

  const existingMessageStat = await MessageStat.findOne({
    message_id,
    user_id,
  });

  if (existingMessageStat) {
    if (is_liked !== undefined) {
      console.log("like is requested");
      countField = "like_count";

      if (existingMessageStat.is_disliked) {
        existingMessageStat.is_disliked = false;
        await decrementCountField(message_id, "dislike_count");
      }

      existingMessageStat.is_liked = !existingMessageStat.is_liked;
      await updateCountField(
        message_id,
        countField,
        existingMessageStat.is_liked
      );
    }

    if (is_disliked !== undefined) {
      console.log("dislike request");
      countField = "dislike_count";

      if (existingMessageStat.is_liked) {
        existingMessageStat.is_liked = false;
        await decrementCountField(message_id, "like_count");
      }

      existingMessageStat.is_disliked = !existingMessageStat.is_disliked;
      await updateCountField(
        message_id,
        countField,
        existingMessageStat.is_disliked
      );
    }

    if (is_fav !== undefined) {
      console.log("fav is requested");
      countField = "fav_count";

      existingMessageStat.is_fav = !existingMessageStat.is_fav;
      await updateCountField(
        message_id,
        countField,
        existingMessageStat.is_fav
      );
    }

    await MessageStat.updateOne(
      { _id: existingMessageStat._id },
      existingMessageStat
    );

    res.status(200).json(existingMessageStat);
  } else {
    console.log("new request");
    const messageStat = await MessageStat.create(req.body);

    if (is_liked) {
      countField = "like_count";
    } else if (is_disliked) {
      countField = "dislike_count";
    } else if (is_fav) {
      countField = "fav_count";
    }

    await updateCountField(message_id, countField, true);

    if (messageStat) {
      res.status(201).json(messageStat);
    } else {
      res.status(400);
      throw new Error("Invalid MessageStat data");
    }
  }
});

async function updateCountField(message_id, countField, increment) {
  const update = increment
    ? { $inc: { [countField]: 1 } }
    : { $inc: { [countField]: -1 } };
  await Message.updateOne(
    { _id: message_id, [countField]: { $exists: true, $type: "number" } },
    update
  );
}

async function decrementCountField(message_id, countField) {
  await Message.updateOne(
    {
      _id: message_id,
      [countField]: { $exists: true, $type: "number" },
      [countField]: { $gt: 0 },
    },
    { $inc: { [countField]: -1 } }
  );
}

// ******** READ ********

// @desc    Get all message-stats
// @route   GET /api/message-stats/:page
// @access  Private/Admin
const getAllMessageStats = asyncHandler(async (req, res) => {
  const resultsPerPage = 50;
  const page = req.params.page || 0;
  const messageStatCount = await MessageStat.countDocuments({});

  const pagination = {
    totalCount: messageStatCount,
    currentPage: page,
  };

  const messageStats = await MessageStat.find({})
    .sort({ createdAt: "asc" })
    .limit(resultsPerPage)
    .skip(resultsPerPage > 0 ? resultsPerPage * (page - 1) : 0);

  res.status(200).json({ messageStats, pagination });
});

// @desc    Get sorted MessageStat
// @route   GET /api/message-stats/sorted/:filterKey/:direction/:numPerPage/:pageNum
// @access  Private/Admin
const getSortedMessageStats = asyncHandler(async (req, res) => {
  const pageNum = req.params.pageNum || 0;
  const filterKey = req.params.filterKey || "createdAt";
  const direction = req.params.direction || "asc";
  const numPerPage = req.params.numPerPage || 25;
  const messageStatCount = await MessageStat.countDocuments({});

  let sortQuery = {};
  sortQuery[filterKey] = direction; // ex { title: "asc" }

  const pagination = {
    totalCount: messageStatCount,
    currentPage: pageNum,
  };

  const messageStats = await MessageStat.find({})
    .sort(filterKey)
    .limit(numPerPage)
    .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0);

  res.status(200).json({ messageStats, pagination });
});

// @desc    Get MessageStat by ID
// @route   GET /api/message-stats/:id
// @access  Private
const getMessageStatById = asyncHandler(async (req, res, next) => {
  const messageStat = await MessageStat.findById(req.params.id);

  if (!messageStat) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json(messageStat);
});

// ******** UPDATE ********

// @desc    Update MessageStat
// @route   PUT /api/message-stats/:id
// @access  Private
const updateMessageStat = asyncHandler(async (req, res, next) => {
  const updatedMessageStat = await MessageStat.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  // If we don't find the user, throw an error.
  if (!updatedMessageStat) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json(updatedMessageStat);
});

// ******** DELETE ********

// @desc    Delete MessageStat
// @route   DELETE /api/message-stats/:id
// @access  Private
const deleteMessageStat = asyncHandler(async (req, res, next) => {
  const messageStat = await MessageStat.findByIdAndDelete(req.params.id);

  if (!messageStat) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({ message: "MessageStat removed" });
});

export {
  createNewMessageStat,
  getMessageStatById,
  getAllMessageStats,
  getSortedMessageStats,
  updateMessageStat,
  deleteMessageStat,
};
