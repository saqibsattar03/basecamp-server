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

// ******** READ ********

// @desc    Get all groups
// @route   GET /api/groups/:page
// @access  Private/Admin
const getAllGroups = asyncHandler(async (req, res) => {
    const resultsPerPage = 50;
    const page = req.params.page || 0;
    const groupCount = await Group.countDocuments({})

    const pagination = {
        totalCount: groupCount,
        currentPage: page
    }

    const groups = await Group.find({})
        .sort({createdAt: "asc"})
        .limit(resultsPerPage)
        .skip(resultsPerPage > 0 ? resultsPerPage * (page - 1) : 0)

    res.status(200).json({groups, pagination});
})


// @desc    Get sorted groups
// @route   GET /api/groups/sorted/:filterKey/:direction/:numPerPage/:pageNum
// @access  Private/Admin
const getSortedGroups = asyncHandler(async (req, res) => {
    const pageNum = req.params.pageNum || 0;
    const filterKey = req.params.filterKey || "createdAt";
    const direction = req.params.direction || "asc";
    const numPerPage = req.params.numPerPage || 25;
    const groupCount = await Group.countDocuments({});

    let sortQuery = {}
    sortQuery[filterKey] = direction // ex { title: "asc" }

    const pagination = {
        totalCount: groupCount,
        currentPage: pageNum
    }

    const groups = await Group.find({})
        .sort(filterKey)
        .limit(numPerPage)
        .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0)

    res.status(200).json({groups, pagination});
})


// @desc    Get popular groups
// @route   GET /api/groups/popular/:numPerPage/:pageNum
// @access  Private/Admin
const getPopularGroups = asyncHandler(async (req, res) => {
    const pageNum = req.params.pageNum || 0;
    const numPerPage = req.params.numPerPage || 25;

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
                metadata: [ { $count: "total" } ],
                data: [ { $skip: numPerPage > 0 ? numPerPage * (pageNum - 1) : 0 }, { $limit: numPerPage } ]
            }
        },
    ]);

    const pagination = {
        totalCount: results[0].metadata[0].total,
        currentPage: pageNum
    }

    res.status(200).json({groups: results[0].data, pagination});
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
    getAllGroups,
    getSortedGroups,
    getPopularGroups,
    updateGroup,
    deleteGroup,
}