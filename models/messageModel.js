import mongoose from "mongoose";
import User from "./userModel.js";
import Group from "./groupModel.js";

export const MessageSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: false,
    },
    image_url: {
      type: String,
      required: false,
    },
    video_url: {
      type: String,
      required: false,
    },
    link_metadata: {
      type: Object,
      required: false,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Group,
      required: true,
    },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    type: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", MessageSchema);
export default Message;
