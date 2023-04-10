import asyncHandler from 'express-async-handler'
import MessageStat from '../models/messageStatModel.js'
import AppError from "../utilis/appError.js";

// ******** CREATE ********

// @desc    Create a new message-stats
// @route   POST /api/message-stats
// @access  Private
const createNewMessageStat = asyncHandler(async (req, res) => {
    const messageStat = await MessageStat.create(req.body)
    if (messageStat) {
        res.status(201).json(messageStat)
    } else {
        res.status(400)
        throw new Error('Invalid MessageStat data')
    }
})

// ******** READ ********

// @desc    Get all message-stats
// @route   GET /api/message-stats/:page
// @access  Private/Admin
const getAllMessageStats = asyncHandler(async (req, res) => {
    const resultsPerPage = 50;
    const page = req.params.page || 0;
    const messageStatCount = await MessageStat.countDocuments({})

    const pagination = {
        totalCount: messageStatCount,
        currentPage: page
    }

    const messageStats = await MessageStat.find({})
        .sort({createdAt: "asc"})
        .limit(resultsPerPage)
        .skip(resultsPerPage > 0 ? resultsPerPage * (page - 1) : 0)

    res.status(200).json({messageStats, pagination});
})


// @desc    Get sorted MessageStat
// @route   GET /api/message-stats/sorted/:filterKey/:direction/:numPerPage/:pageNum
// @access  Private/Admin
const getSortedMessageStats = asyncHandler(async (req, res) => {
    const pageNum = req.params.pageNum || 0;
    const filterKey = req.params.filterKey || "createdAt";
    const direction = req.params.direction || "asc";
    const numPerPage = req.params.numPerPage || 25;
    const messageStatCount = await MessageStat.countDocuments({});

    let sortQuery = {}
    sortQuery[filterKey] = direction // ex { title: "asc" }

    const pagination = {
        totalCount: messageStatCount,
        currentPage: pageNum
    }

    const messageStats = await MessageStat.find({})
        .sort(filterKey)
        .limit(numPerPage)
        .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0)

    res.status(200).json({messageStats, pagination});
})


// @desc    Get MessageStat by ID
// @route   GET /api/message-stats/:id
// @access  Private
const getMessageStatById = asyncHandler(async (req, res, next) => {
    const messageStat = await MessageStat.findById(req.params.id)

    if (!messageStat) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json(messageStat)
})

// ******** UPDATE ********

// @desc    Update MessageStat
// @route   PUT /api/message-stats/:id
// @access  Private
const updateMessageStat = asyncHandler(async (req, res, next) => {
    const updatedMessageStat = await MessageStat.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    // If we don't find the user, throw an error.
    if (!updatedMessageStat) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json(updatedMessageStat)
})

// ******** DELETE ********

// @desc    Delete MessageStat
// @route   DELETE /api/message-stats/:id
// @access  Private
const deleteMessageStat = asyncHandler(async (req, res, next) => {
    const messageStat = await MessageStat.findByIdAndDelete(req.params.id)

    if (!messageStat) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({message: 'MessageStat removed'});
})


export {
    createNewMessageStat,
    getMessageStatById,
    getAllMessageStats,
    getSortedMessageStats,
    updateMessageStat,
    deleteMessageStat,
}