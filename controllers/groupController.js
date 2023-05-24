import asyncHandler from 'express-async-handler'
import Group from '../models/groupModel.js'
import AppError from "../utilis/appError.js";

// ******** CREATE ********

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createNewGroup = asyncHandler(async (req, res) => {
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
        const searchRegex = new RegExp(req.query.text, 'i');
        query = {
            $or: [
                { username: { $regex: searchRegex } },
                { name: { $regex: searchRegex } },
                { location: { $regex: searchRegex } },
            ]
        };
    }
    const pageNum = req.query.pageNum || 0;
    const filterKey = req.query.filterKey || "createdAt";
    const direction = req.query.direction || "asc";
    const numPerPage = req.query.numPerPage || 25;
    const groupCount = await Group.countDocuments(query);

    let sortQuery = {}
    sortQuery[filterKey] = direction // ex { title: "asc" }

    const pagination = {
        totalCount: groupCount,
        currentPage: pageNum
    }

    const groups = await Group.find(query)
        .sort(sortQuery)
        .limit(numPerPage)
        .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0)

    res.status(200).json({ groups, pagination });
})







const getMyGroups = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    console.log(userId)
    const query = { followers: userId };

    const pageNum = req.query.pageNum || 0;
    const filterKey = req.query.filterKey || 'createdAt';
    const direction = req.query.direction || 'asc';
    const numPerPage = req.query.numPerPage || 25;
    const groupCount = await Group.countDocuments(query);

    let sortQuery = {};
    sortQuery[filterKey] = direction; // ex { title: "asc" }

    const pagination = {
        totalCount: groupCount,
        currentPage: pageNum,
    };

    const groups = await Group.find(query)
        .sort(sortQuery)
        .limit(numPerPage)
        .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0);

    res.status(200).json({ groups, pagination });
});





// @desc    Get popular groups
// @route   GET /api/groups/popular?numPerPage=10&pageNum=0
// @access  Private/Admin
const getPopularGroups = asyncHandler(async (req, res) => {
    const pageNum = req.query.pageNum || 0;
    const numPerPage = req.query.numPerPage || 25;

    const results = await Group.aggregate([
        {
            $addFields: {
                followers_count: { $size: "$followers" }
            }
        },
        {
            $sort: { followers_count: -1 }
        },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $skip: numPerPage > 0 ? numPerPage * (pageNum - 1) : 0 }, { $limit: numPerPage }]
            }
        },
    ]);

    const pagination = {
        totalCount: results[0].metadata[0].total,
        currentPage: pageNum
    }

    res.status(200).json({ groups: results[0].data, pagination });
})


// @desc    Get group by ID
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id)

    res.status(200).json(group);
})

// ******** UPDATE ********

// @desc    Update group group
// @route   PUT /api/groups/:id
// @access  Private
const updateGroup = asyncHandler(async (req, res, next) => {

    const group = await Group.findByIdAndUpdate(req.params.id)

    // If we don't find the message, throw an error.
    if (!group) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json(group)
})


// @desc    Update group followers
// @route   PUT /api/groups/:id
// @access  Private

const updateGroupFollowers = asyncHandler(async (req, res, next) => {
    const groupId = req.params.id;
    const group = await Group.findById(groupId);

    if (!group) {
        return next(new AppError('No document found with that ID', 404));
    }

    const userId = req.user._id;

    const followerIndex = group.followers.indexOf(userId);

    if (followerIndex > -1) {
        group.followers.splice(followerIndex, 1);
    } else {
        group.followers.push(userId);
    }

    await group.save();

    res.status(200).json(group);
});


// ******** DELETE ********

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = asyncHandler(async (req, res, next) => {
    const group = await Group.findByIdAndDelete(req.params.id)

    // If we don't find the message, throw an error.
    if (!group) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json(group)
})


export {
    createNewGroup,
    getGroupById,
    getFilteredGroups,
    getPopularGroups,
    getMyGroups,
    updateGroup,
    updateGroupFollowers,
    deleteGroup,
}