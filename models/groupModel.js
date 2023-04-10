import mongoose from 'mongoose';

import User from './userModel.js';


export const GroupSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	location: {
		type: String,
	},
	date: {
		type: Date,
	},
	username: {
		type: String,
		required: true,
		unique: true,
	},
	profile_image: {
		type: String,
	},
	created_by: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
		required: true,
	},
	messages_count: {
		type: Number,
		default: 0
	},
	media_count: {
		type: Number,
		default: 0
	},
	followers: [{
		type: Array,
	}],
});

const Group = mongoose.model('Group', GroupSchema);
export default Group;