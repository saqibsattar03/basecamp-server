import mongoose from 'mongoose';
import User from './userModel.js';
import Group from './groupModel.js';


export const MessageSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: true,
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
		ref: 'Message',
	},
	type: {
		type: Number,
		required: true,
	},
});

const Message = mongoose.model('Message', MessageSchema);
export default Message;