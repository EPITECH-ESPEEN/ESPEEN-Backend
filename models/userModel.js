import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User name is required'],
        maxLength: [50, 'User name cannot exceed 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'User email is required'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'User password is required'],
        minLength: [8, 'User password must be longer than 8 characters'],
        validate: {
            validator: function (password) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
                // return password.match(/\d+/g) && password.match(/[a-zA-Z]+/g);
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        },
        select: false,
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: 'user',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

}, {timestamps: true}
);

//Password encryption
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

//Return JWT
userSchema.methods.getJWTToken = function() {
    //Assign token to a user
    return  jwt.sign({ id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
};

//Compare req password
userSchema.methods.comparePassword = async function(reqPassword) {
    return await bcrypt.compare(reqPassword, this.password);
}

//Password reset
userSchema.methods.getResetPasswordToken = function () {
    //Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    //Hash token
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    return resetToken;
}


export default mongoose.model('User', userSchema);