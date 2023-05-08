import express from 'express'

const router = express.Router()
import {
    createNewGroup,
    deleteGroup,
    getGroupById,
    updateGroup,
    getFilteredGroups,
    getPopularGroups,
} from '../controllers/groupController.js'
import protect from '../middleware/authMiddleware.js'

router.route('/')
    .post(protect, createNewGroup)
router.route('/filter')
    .get(protect, getFilteredGroups)
router.route('/popular')
    .get(protect, getPopularGroups)
router.route('/:id')
    .get(protect, getGroupById)
router.route('/:id')
    .put(protect, updateGroup)
router.route('/:id')
    .delete(protect, deleteGroup)

export default router