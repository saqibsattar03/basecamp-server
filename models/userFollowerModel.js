import mongoose from 'mongoose';

import User from './userModel.js';


export const UserFollowerSchema = mongoose.Schema({
	follower: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
		required: true,
	},
	following: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
		required: true,
	},
}, {
	timestamps: true
});

const UserFollower = mongoose.model('UserFollower', UserFollowerSchema);
export default UserFollower;