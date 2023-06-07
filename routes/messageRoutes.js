import express from "express";
const router = express.Router();
import {
  createNewMessage,
  deleteMessage,
  getMessageById,
  updateMessage,
  getFilteredMessages,
  getMyGroupsMessages,
} from "../controllers/messageController.js";
import protect from "../middleware/authMiddleware.js";

router.route("/").post(protect, createNewMessage);
router.route("/filter").get(protect, getFilteredMessages);
router.route("/myGroups").get(protect, getMyGroupsMessages);
router.route("/:id").get(protect, getMessageById);
router.route("/:id").put(protect, updateMessage);
router.route("/:id").delete(protect, deleteMessage);

export default router;
