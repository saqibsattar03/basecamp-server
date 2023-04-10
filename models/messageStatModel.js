import mongoose from 'mongoose';

import User from './userModel.js';
import Group from './groupModel.js';


export const MessageStatSchema = mongoose.Schema({
	message_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: Group,
		required: true,
	},
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
		required: true,
	},
	type: {
		type: Number,
		required: true,
	},
});

const MessageStat = mongoose.model('MessageStat', MessageStatSchema);
export default MessageStat;