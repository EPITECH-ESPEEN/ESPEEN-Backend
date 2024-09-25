import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js"
import sendToken from "../utils/sendToken.js";

// Register user : /api/register
export const registerUser = catchAsyncErrors(async(req, res, next) => {
    const { name, email, password } = req.body;

    const user = await User.create( {
        name,
        email,
        password,
    });

    sendToken(user, 201, res);
});

// Login user : /api/login
export const loginUser = catchAsyncErrors(async(req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Email and password are required", 400));
    }

    const user = await User.findOne({email}).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const token = user.getJWTToken();

    sendToken(user, 200, res);
});

// Logout user : /api/logout
export const logoutUser = catchAsyncErrors(async(req, res, next) => {
    res.clearCookie("token");

    res.status(200).json({
        message: "Logged out",
    });
});

//Get current user profile : /api/v1/profile
export const getUserProfile = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findById(req?.user?._id);

    res.status(200).json({
        user,
    });
});