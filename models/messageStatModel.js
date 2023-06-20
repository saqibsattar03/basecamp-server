import mongoose from "mongoose";

import User from "./userModel.js";
import Group from "./groupModel.js";
import Message from "./messageModel.js";

export const MessageStatSchema = mongoose.Schema(
  {
    message_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Message,
      //  ref: Group,
      required: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    is_liked: {
      type: Boolean,
      default: false,
    },

    is_disliked: {
      type: Boolean,
      default: false,
    },
    is_fav: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

const MessageStat = mongoose.model("MessageStat", MessageStatSchema);
export default MessageStat;
