import asyncHandler from "express-async-handler";
import Message from "../models/messageModel.js";
import AppError from "../utilis/appError.js";
import MessageStat from "../models/messageStatModel.js";
import Group from "../models/groupModel.js";
import mongoose from "mongoose";

// ******** CREATE ********

// @desc    Create a new message
// @route   POST /api/messages
// @access  Private
const createNewMessage = asyncHandler(async (req, res) => {
  const message = await Message.create(req.body);
  await Message.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(req.body.parent_id) },
    { $inc: { sub_reply_count: 1 } }
  );
  await Group.findOneAndUpdate(
    { _id: req.body.group_id },
    {
      $inc: {
        messages_count: req.body.type === 0 ? 1 : 0,
        media_count: req.body.type !== 0 ? 1 : 0,
      },
    }
  );

  if (message) {
    res.status(201).json(message);
  } else {
    res.status(400);
    throw new Error("Invalid message data");
  }
});

// @desc    Get filtered messages
// @route   GET /api/messages/filter?numPerPage=20&pageNum=0&filterKey=createdAt&direction=asc&groupId=1234&popular=true&pinned=true
// @access  Private/Admin
const getFilteredMessages = asyncHandler(async (req, res) => {
  console.log(req.query);
  const pageNum = req.query.pageNum || 0;
  const filterKey = req.query.filterKey || "createdAt";
  const direction = req.query.direction || "asc";
  const numPerPage = req.query.numPerPage || 25;
  const query = {};
  const loggedUserId = req.user._id;
  if (req.query.userId) {
    query["created_by"] = req.query.userId;
  }

  if (req.query.groupId) {
    query["group_id"] = req.query.groupId;
  }

  if (req.query.parentId) {
    query["parent_id"] = req.query.parentId;
  } else {
    console.log("parent text");
    if (req.query.type === 0) {
      query["parent_id"] = null;
    }
  }
  if (req.query.type) {
    // if (req.query.type == 0 && query["parent_id"] == null) {
    //   query["type"] = req.query.type;
    // } else {
    query["type"] = req.query.type;
    // }
  }
  // if (req.query.parentId) {
  //   query["parent_id"] = req.query.parentId;
  // } else {
  //
  //     query["parent_id"] = null;
  //
  // }
  //
  // if (req.query.type) {
  //   if (req.query.type == 0) {
  //     query["parent_id"] = null;
  //   }
  //   query["type"] = req.query.type;
  // }



  let sortQuery1 = {};
  let totalCount, pagination;

  if (req.query.popular || req.query.pinned) {
    // Apply popular or pinned filter if selected
    sortQuery1 = req.query.popular ? { like_count: -1 } : { fav_count: -1 };

    const messages = await Message.find(query)
      .populate("created_by group_id")
      .sort(sortQuery1)
      .limit(numPerPage)
      .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0);

    totalCount = await Message.countDocuments(query);

    pagination = {
      totalCount,
      currentPage: pageNum,
    };
    const messageIds = messages.map((message) => message._id);
    await getMessageCommonFields(messageIds,loggedUserId,messages)
    return res.status(200).json({ messages, pagination });
  }

  if (req.query.recent) {
    // Apply recent filter if selected
    const messages = await Message.find(query)
      .populate("created_by group_id")
      .sort({ createdAt: -1 })
      .limit(numPerPage)
      .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0);

    totalCount = await Message.countDocuments(query);

    pagination = {
      totalCount,
      currentPage: pageNum,
    };
    const messageIds = messages.map((message) => message._id);
    await getMessageCommonFields(messageIds,loggedUserId,messages)
    return res.status(200).json({ messages, pagination });
  }
  const sortQuery = {};
  sortQuery[filterKey] = direction;

  const messageCount = await Message.countDocuments(query);

  pagination = {
    totalCount: messageCount,
    currentPage: pageNum,
  };

  const messages = await Message.find(query)
    .sort(sortQuery)
    .limit(numPerPage)
    .populate("created_by group_id")
    .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0);

  const messageIds = messages.map((message) => message._id);
  await getMessageCommonFields(messageIds,loggedUserId,messages)
  // const messageStats = await MessageStat.find({
  //   message_id: { $in: messageIds },
  //   user_id: loggedUserId,
  // });
  //
  // console.log("message stats :: ", messageStats)
  // messageStats.forEach((messageStat) => {
  //   for (let i = 0; i < messages.length; ++i) {
  //     if (messages[i]._id.toString() === messageStat.message_id.toString()) {
  //       messages[i]._doc.is_liked = messageStat.is_liked;
  //       messages[i]._doc.is_disliked = messageStat.is_disliked;
  //
  //       messages[i]._doc.is_fav = messageStat.is_fav;
  //       break;
  //     }
  //   }
  // });
  res.status(200).json({ messages, pagination });
});


async function getMessageCommonFields(messageIds,loggedUserId,messages){
  const messageStats = await MessageStat.find({
    message_id: { $in: messageIds },
    user_id: loggedUserId,
  });

  // console.log("message stats :: ", messageStats)
  messageStats.forEach((messageStat) => {
    for (let i = 0; i < messages.length; ++i) {
      if (messages[i]._id.toString() === messageStat.message_id.toString()) {
        messages[i]._doc.is_liked = messageStat.is_liked;
        messages[i]._doc.is_disliked = messageStat.is_disliked;
        messages[i]._doc.is_fav = messageStat.is_fav;
        break;
      }
    }
  });
}

/// /////

const getMyGroupsMessages = asyncHandler(async (req, res) => {
  const pageNum = req.query.pageNum || 0;
  const numPerPage = req.query.numPerPage || 25;

  const loggedUserId = req.user._id;
  // const messages = await Message.find()
  //     .limit(numPerPage)
  //     .populate("created_by")
  //     .populate("group_id")
  //     .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0);
  //
  // console.log("loggedUserId :: ", loggedUserId)
  // const allGroupIds = messages.map((message) => message.group_id._id);
  // const groupQuery = {
  //   // _id: { $in: allGroupIds },
  //   followers: loggedUserId,
  // };
  // console.log("groups with users :: ", groupsWithUser)
  // const myGroupsIds = groupsWithUser.map((group) => group._id.toString());
  // console.log("my group ids :: ", myGroupsIds);
  // const filteredMessages = messages.filter((message) =>
  //   myGroupsIds.includes(message.group_id._id.toString())
  // );
  // const filteredMessageIds = filteredMessages.map((message) => message._id);
  //
  // const messageCount = await Message.countDocuments({
  //   _id: { $in: filteredMessageIds },
  // });
  //
  //
  // const pagination = {
  //   totalCount: messageCount,
  //   currentPage: pageNum,
  // };
  //
  // res.status(200).json({ messages: filteredMessages, pagination });
  const groupsWithUser = await Group.find({followers: loggedUserId}).select('_id');
  const messages = await Message
      .find({group_id : {$in:groupsWithUser}})
      .populate("group_id")
      .populate("created_by")
      .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0);

  const messageCount = await Message.countDocuments({
    _id: { $in: messages },
  });

  const pagination = {
    totalCount: messageCount,
    currentPage: pageNum,
  };
  res.status(200).json({ messages: messages, pagination});
});

// @desc    Get message by ID
// @route   GET /api/messages/:id
// @access  Private
const getMessageById = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  res.status(200).json(message);
});

// ******** UPDATE ********

// @desc    Update message
// @route   PUT /api/messages/:id
// @access  Private
const updateMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // If we don't find the message, throw an error.
  if (!message) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json(message);
});

// ******** DELETE ********

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);

  if (!message) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({ message: "Message removed" });
});

export {
  createNewMessage,
  getMessageById,
  getFilteredMessages,
  updateMessage,
  deleteMessage,
  getMyGroupsMessages,
};
