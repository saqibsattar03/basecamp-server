import mongoose from 'mongoose';
import bcrypt from "bcrypt";
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
	is_verified: {
		type: Boolean,
		required: true,
		default: false
	},
	avatar: {
		type: String,
	},
});
UserSchema.methods.matchPassword = async function (enteredPassword) {

    if (enteredPassword)
        return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    if (this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});


const User = mongoose.model('User', UserSchema);
export default User;