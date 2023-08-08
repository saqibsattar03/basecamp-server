import express from 'express'
import {
  createNewGroup,
  deleteGroup,
  getGroupById,
  getMyGroups,
  updateGroup,
  updateGroupFollowers,
  getFilteredGroups,
  getPopularGroups, populateFollowersByGroupId
} from '../controllers/groupController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/').post(protect, createNewGroup)
router.route('/filter').get(protect, getFilteredGroups)
router.route('/popular').get(protect, getPopularGroups)
router.route('/:id').get(protect, getGroupById)
router.route('/:id').patch(protect, updateGroup)
router.route('/updateFollowers/:id').put(protect, updateGroupFollowers)
// router.route('/myGroups/filter/:id').get(protect, getMyGroups)
router.route('/myGroups/filter').get(getMyGroups)
router.route('/populate-followers/:id').get(protect, populateFollowersByGroupId)

router.route('/:id').delete(protect, deleteGroup)

export default router
