import mongoose from 'mongoose';

export const UserSchema = mongoose.Schema({
	first_name: {
		type: String,
		required: true,
	},
	last_name: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	dob: {
		type: Date,
		required: true,
	},
	bio: {
		type: String,
	},
	verification_photos: [{
		type: String,
	}],
	is_verified: {
		type: Boolean,
		required: true,
		default: false
	},
	avatar: {
		type: String,
	},
}, {
	timestamps: true
});

const User = mongoose.model('User', UserSchema);
export default User;