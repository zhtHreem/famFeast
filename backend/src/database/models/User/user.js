//const mongoose = require('mongoose');
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
});





  // Hash the password before saving the user
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};


const User = mongoose.model('User',UserSchema);

export default User; 