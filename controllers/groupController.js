import asyncHandler from 'express-async-handler'
import Group from '../models/groupModel.js'
import AppError from '../utilis/appError.js'

// ******** CREATE ********

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createNewGroup = asyncHandler(async (req, res) => {
  console.log(req.body)
  const group = await Group.create(req.body)

  if (group) {
    res.status(201).json(group)
  } else {
    res.status(400)
    throw new Error('Invalid group data')
  }
})

// @desc    Get filtered groups
// @route   GET /api/groups/filter?text=trip2023&pageNum=0&numPerPage=20&filterKey=createdAt&direction=asc
// @access  Private/Admin

const getFilteredGroups = asyncHandler(async (req, res) => {
  let query = {}
  if (req.query.text) {
    const searchRegex = new RegExp(req.query.text, 'i')
    query = {
      $or: [
        { username: { $regex: searchRegex } },
        { name: { $regex: searchRegex } },
        { location: { $regex: searchRegex } }
      ]
    }
  }
  const pageNum = req.query.pageNum || 0


  const filterKey = req.query.filterKey || 'createdAt'
  const direction = req.query.direction || 'asc'
  const numPerPage = req.query.numPerPage || 25
  const groupCount = await Group.countDocuments(query)

  const sortQuery = {}
  sortQuery[filterKey] = direction // ex { title: "asc" }

  const pagination = {
    totalCount: groupCount,
    currentPage: pageNum
  }

  const groups = await Group.find(query)
    .sort(sortQuery)
    .limit(numPerPage)
    .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0)
  res.status(200).json({ groups, pagination })
})

/// /

const getMyGroups = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const query = { followers: userId }

  const pageNum = req.query.pageNum || 0
  const filterKey = req.query.filterKey || 'createdAt'
  const direction = req.query.direction || 'asc'
  const numPerPage = req.query.numPerPage || 25
  const groupCount = await Group.countDocuments(query)

  const sortQuery = {}
  sortQuery[filterKey] = direction // ex { title: "asc" }

  const pagination = {
    totalCount: groupCount,
    currentPage: pageNum
  }

  const groups = await Group.find(query)
  .sort(sortQuery)
  .limit(numPerPage)
  .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0)

  res.status(200).json({ groups, pagination })
})

// @desc    Get popular groups
// @route   GET /api/groups/popular?numPerPage=10&pageNum=0
// @access  Private/Admin

const getPopularGroups = asyncHandler(async (req, res) => {
  const pageNum = req.query.pageNum || 0
  const numPerPage = parseInt(req.query.numPerPage) || 25

  let query = {}

  if (req.query.text) {
    const searchRegex = new RegExp(req.query.text, 'i')
    query = {
      $or: [
        { username: { $regex: searchRegex } },
        { name: { $regex: searchRegex } },
        { location: { $regex: searchRegex } }
      ]
    }
  }
  const results = await Group.aggregate([
    {
      $match: query
    },
    {
      $addFields: {
        followers_count: { $size: '$followers' }
      }
    },
    {
      $sort: { followers_count: -1 }
    },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $skip: numPerPage > 0 ? numPerPage * (pageNum - 1) : 0 },
          { $limit: numPerPage }
        ]
      }
    },
  ])

  if (
    results.length > 0 &&
    results[0].metadata &&
    results[0].metadata.length > 0
  ) {
    const totalCount = results[0].metadata[0].total
    const groups = results[0].data

    const pagination = {
      totalCount,
      currentPage: pageNum
    }

    res.status(200).json({ groups, pagination })
  } else {
    res
      .status(200)
      .json({ groups: [], pagination: { totalCount: 0, currentPage: 0 } })
  }
})

// @desc    Get group by ID
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)

  res.status(200).json(group)
})

// ******** UPDATE ********

// @desc    Update group group
// @route   PUT /api/groups/:id
// @access  Private
const updateGroup = asyncHandler(async (req, res, next) => {
  console.log(req.body)
  const group = await Group.findByIdAndUpdate(req.params.id, req.body)

  // If we don't find the message, throw an error.
  if (!group) {
    return next(new AppError('No document found with that ID', 404))
  }

  res.status(200).json(group)
})

// @desc    Update group followers
// @route   PUT /api/groups/:id
// @access  Private

const updateGroupFollowers = asyncHandler(async (req, res, next) => {
  const groupId = req.params.id
  const group = await Group.findById(groupId)

  if (!group) {
    return next(new AppError('No document found with that ID', 404))
  }

  const userId = req.user._id

  const followerIndex = group.followers.indexOf(userId)

  if (followerIndex > -1) {
    group.followers.splice(followerIndex, 1)
  } else {
    group.followers.push(userId)
  }

  await group.save()

  res.status(200).json(group)
})

// ******** DELETE ********

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = asyncHandler(async (req, res, next) => {
  const group = await Group.findByIdAndDelete(req.params.id)

  // If we don't find the message, throw an error.
  if (!group) {
    return next(new AppError('No document found with that ID', 404))
  }

  res.status(200).json(group)
})


// ******** GET ********

// @desc    Get populated followers
// @route   GET /groups/populate-followers/:groupId
// @access  Private
const populateFollowersByGroupId = asyncHandler(async (req, res, next) => {
  try {
    const pageNum = req.query.pageNum || 0
    const filterKey = req.query.filterKey || 'createdAt'
    const direction = req.query.direction || 'asc'
    const numPerPage = req.query.numPerPage || 25
    const sortQuery = {}
    sortQuery[filterKey] = direction


    const response = await Group.findById(req.params.id)
        .populate('followers', 'first_name last_name avatar is_verified username')
        .select('-_id -name -location -date -username -profile_image -created_by -messages_count -media_count -createdAt -updatedAt -__v')
        .limit(numPerPage)
        .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0)
        .sort(sortQuery)
    const pagination = {
      totalCount: response.followers.length,
      currentPage: pageNum
    }
    res.status(200).json({"followers":response.followers,pagination});
  } catch (error) {
    next(error);
  }
});

export {
  createNewGroup,
  getGroupById,
  getFilteredGroups,
  getPopularGroups,
  getMyGroups,
  updateGroup,
  updateGroupFollowers,
  deleteGroup,
  populateFollowersByGroupId
}
