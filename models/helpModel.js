import mongoose from 'mongoose'

import User from './userModel.js'

export const HelpSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true
    }
  },
  {
    timestamps: true
  }
)

const Help = mongoose.model('Help', HelpSchema)
export default Help
