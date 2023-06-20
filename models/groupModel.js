import mongoose from 'mongoose'

import User from './userModel.js'

export const GroupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      index: true,
      required: true
    },
    location: {
      type: String,
      index: { sparse: true }
    },
    date: {
      type: Date
    },
    username: {
      type: String,
      required: true,
      unique: true
    },
    profile_image: {
      type: String
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true
    },
    messages_count: {
      type: Number,
      default: 0
    },
    media_count: {
      type: Number,
      default: 0
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
      }
    ]
  },
  {
    timestamps: true
  }
)

const Group = mongoose.model('Group', GroupSchema)
export default Group
