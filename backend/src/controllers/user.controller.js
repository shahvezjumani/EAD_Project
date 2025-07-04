import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFileFromCloudinary,
} from "../utils/cloudinary.js";
import { log } from "console";
import { transporter } from "../utils/nodemailer.js";

const getFilePath = (files, fieldName) => {
  return files && Array.isArray(files[fieldName]) && files[fieldName].length > 0
    ? files[fieldName][0].path
    : null;
};

const uploadAndDeleteIfExists = async (
  localPath,
  previousUrl,
  uploadFn,
  deleteFn
) => {
  let response = null;
  if (localPath) {
    response = await uploadFn(localPath);
    const publicId = previousUrl?.split("/").pop().split(".")[0]; // Extract publicId from URL
    await deleteFn(publicId);
    // explicitly commit this lines of code
    // if (!isImageDeleted) {
    //   throw new ApiError(500, "Failed to delete image from Cloudinary");
    // }
  }
  return response;
};

const buildUpdateFields = (uploadsMap) => {
  const fields = {};
  for (const [key, value] of Object.entries(uploadsMap)) {
    if (value) fields[key] = value.url;
  }
  return fields;
};

// to generate access and refresh tokens for user during login
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

// will see later and work on it later
// const registerUser = asyncHandler(async (req, res) => {
//   const { userName, email, password } = req.body;

//   if (!userName || !email || !password) {
//     throw new ApiError(400, "All fields are required");
//   }

//   const existingUser = await User.findOne({ email, userName });
//   if (existingUser) {
//     throw new ApiError(
//       409,
//       "User with this username and/or email already exists"
//     );
//   }

//   const slug = userName.toLowerCase().replace(/\s+/g, "-");

//   const slugExists = await User.findOne({ slug });
//   if (slugExists) {
//     throw new ApiError(
//       409,
//       "Username already taken, please choose a different name"
//     );
//   }

//   const user = await User.create({
//     userName,
//     email,
//     password,
//     slug,
//   });

//   const createdUser = await User.findById(user._id).select(
//     "-password -refreshToken"
//   );

//   if (!createdUser) {
//     throw new ApiError(500, "Something went wrong while registering the user");
//   }

//   // await sendVerifyOtp(user._id);

//   const emailOptions = {
//     from: process.env.SMTP_EMAIL,
//     to: email,
//     subject: `🚀 Welcome aboard, ${userName}! Your portfolio journey begins now.`,
//     text: `Hi ${userName}, 👋

//   Welcome to Editable Portfolio – your personal space to create, customize, and showcase your talents to the world.

//   ✨ What's next?
//   Start editing your profile, adding your skills, and building the portfolio that reflects YOU. Everything is customizable – just the way you want it.
//   Your Profile URL: ${process.env.CORS_ORIGIN}/${slug}

//   We're excited to see what you build!

//   Cheers,
//   The Editable Portfolio Team 💼
//   `,
//   };

//   await transporter.sendMail(emailOptions);

//   return res
//     .status(201)
//     .json(new ApiResponse(201, createdUser, "User registered successfully"));
// });

const updateUser = asyncHandler(async (req, res) => {
  const user = req?.user;
  // console.log(user, "i am user");

  const {
    aboutMe,
    skills,
    bannerColor,
    theme,
    availabilityHeading,
    topHeading,
    topHeadingHeight,
    numberOfProjects,
    yearOfExperience,
    emailUrl,
    contactLinks,
  } = req.body;

  // to get the file path of the uploaded files that are uploaded by multer to uploading on cloudinary
  const logoUrlLocalPath = getFilePath(req.files, "logoUrlFile");
  const bannerUrlLocalPath = getFilePath(req.files, "bannerUrlFile");
  const availabilityIconUrlLocalPath = getFilePath(
    req.files,
    "availabilityIconUrlFile"
  );
  const aboutMeIconUrlLocalPath = getFilePath(req.files, "aboutMeIconUrlFile");
  const resumeLocalPath = getFilePath(req.files, "resume");

  // Upload to Cloudinary and get response
  const [logoUrl, bannerUrl, availabilityIconUrl, aboutMeIconUrl] =
    await Promise.all([
      uploadAndDeleteIfExists(
        logoUrlLocalPath,
        user?.logoUrl,
        uploadOnCloudinary,
        deleteFileFromCloudinary
      ),
      uploadAndDeleteIfExists(
        bannerUrlLocalPath,
        user?.bannerUrl,
        uploadOnCloudinary,
        deleteFileFromCloudinary
      ),
      uploadAndDeleteIfExists(
        availabilityIconUrlLocalPath,
        user?.availabilityIconUrl,
        uploadOnCloudinary,
        deleteFileFromCloudinary
      ),
      uploadAndDeleteIfExists(
        aboutMeIconUrlLocalPath,
        user?.aboutMeIconUrl,
        uploadOnCloudinary,
        deleteFileFromCloudinary
      ),
    ]);

  log;
  let resumeUrl = null;
  if (resumeLocalPath) {
    resumeUrl = await uploadOnCloudinary(resumeLocalPath, "raw");
    await deleteFileFromCloudinary(
      user?.resume.split("/").pop().split(".")[0],
      "raw"
    );
  }

  // to get an object with the urls of these uploaded files on cloudinary / only for whose values exist
  const updateFields = buildUpdateFields({
    logoUrl,
    bannerUrl,
    availabilityIconUrl,
    aboutMeIconUrl,
    resume: resumeUrl,
  });

  if (aboutMe) updateFields.aboutMe = aboutMe;
  if (skills?.length > 0) updateFields.skills = skills;
  if (bannerColor) updateFields.bannerColor = bannerColor;
  if (theme) updateFields.theme = theme;
  if (availabilityHeading)
    updateFields.availabilityHeading = availabilityHeading;
  if (topHeading) updateFields.topHeading = topHeading;
  if (topHeadingHeight) updateFields.topHeadingHeight = topHeadingHeight;
  if (numberOfProjects !== undefined)
    updateFields.numberOfProjects = numberOfProjects;
  if (yearOfExperience !== undefined)
    updateFields.yearOfExperience = yearOfExperience;
  if (emailUrl) updateFields.emailUrl = emailUrl;
  if (contactLinks) updateFields.contactLinks = contactLinks;

  // Update user profile
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: updateFields,
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User profile updated successfully")
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let userResponse = user.toObject();
  const projects = await Project.find({ owner: user._id }).select("-owner");
  if (projects?.length > 0) {
    userResponse.projects = projects;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userResponse, "User details fetched successfully")
    );
});

const removeUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);

  await Project.deleteMany({ owner: req.user?._id });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User account deleted successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User with this email not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: null },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getUserBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const user = await User.findOne({ slug }).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let userResponse = user.toObject();
  const projects = await Project.find({ owner: user._id }).select("-owner");
  if (projects?.length > 0) {
    userResponse.projects = projects;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userResponse, "User profile fetched successfully")
    );
});

// to refresh the access token using the refresh token
// this is used when the access token expires
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// const sendVerifyOtp = async (userId) => {
//   try {
//     const user = await User.findById(userId);
//     if (!user) {
//       throw new ApiError(404, "User not found");
//     }
//     const otp = String(Math.floor(100000 + Math.random() * 900000));
//     user.verifyOtp = otp;
//     user.verifyOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
//     await user.save({ validateBeforeSave: false });

//     const emailOptions = {
//       from: process.env.SMTP_EMAIL,
//       to: user.email,
//       subject: "Verify your email address",
//       text: `Your OTP for email verification is ${otp}. It is valid for 10 minutes.`,
//     };
//     await transporter.sendMail(emailOptions);
//   } catch (error) {
//     throw new ApiError(500, "Something went wrong while sending OTP");
//   }
// };

// Email verification via OTP

const sendVerifyOtp = async (req, res) => {
  try {
    // search the user with email from database
    const { userId } = req.body;
    // const {slug} = req.params;

    const user = await userModel.findById(userId);

    if (user.isVerified) {
      return res.json({ success: false, message: "Account Already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SMTP_EMAIL,
      to: user.email,
      subject: `Account Verification OTP`,
      text: `Your OTP for email verification is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOption);

    res.json({ success: true, message: "Verification OTP send on email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// will see this code later
// const verifyEmail = async (req, res) => {
//   const { userId } = req.body;

//   if (!userId || !otp) {
//     return res.json({ success: false, message: "Missing Details" });
//   }

//   try {
//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.json({ success: false, message: "User not found" });
//     }

//     if (user.verifyOtp === "" || user.verifyOtp !== otp) {
//       return res.json({ success: false, message: "Invalid OTP" });
//     }

//     if (user.verifyOtpExpiry < Date.now()) {
//       return res.json({ success: false, message: "OTP Expired" });
//     }

//     user.isVerified = true;
//     user.verifyOtp = "";
//     user.verifyOtpExpiry = 0;

//     await user.save();
//     return res.json({ success: true, message: "Email verified Successfully" });
//   } catch (error) {
//     return res.json({ success: false, message: error.message });
//   }
// };

//Forgot Password

const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SMTP_EMAIL,
      to: user.email,
      subject: `Password Reset OTP`,
      text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOption);

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// will see this code later
// const resetPassword = async (req, res) => {
//   const { email, otp, newPassword } = req.body;

//   // search user with userId from database then change the password
//   // will get userId, newPassword, and confirmPassword from req.body

//   if (!email || !otp || !newPassword) {
//     return res.json({
//       success: false,
//       message: "Email, OTP, and new password are required",
//     });
//   }

//   try {
//     const user = await userModel.findOne({ email });

//     if (!user) {
//       return res.json({ success: false, message: "User not found" });
//     }

//     if (user.resetOtp === "" || user.resetOtp !== otp) {
//       return res.json({ success: false, message: "Invalid OTP" });
//     }

//     if (user.resetOtpExpiry < Date.now()) {
//       return res.json({ success: false, message: "OTP Expired" });
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     user.password = hashedPassword;
//     user.resetOtp = "";
//     user.resetOtpExpiry = 0;

//     await user.save();

//     return res.json({
//       success: true,
//       message: "Password has been reset successfully",
//     });
//   } catch (error) {
//     return res.json({ success: false, message: error.message });
//   }
// };

// Function to generate a random OTP

const generateOTP = (length = 6) => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

const sendVerificationOTP = async (user) => {
  const otp = generateOTP();
  const otpExpiry = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

  await User.findByIdAndUpdate(user._id, {
    verifyOtp: otp,
    verifyOtpExpiry: otpExpiry,
    isVerfied: false,
  });

  // Send OTP email
  const emailOptions = {
    from: process.env.SMTP_EMAIL,
    to: user.email,
    subject: `Verify your Editable Portfolio account`,
    text: `Hi ${user.userName}, 👋
    
Welcome to Editable Portfolio! To complete your registration, please verify your email address using the OTP below:

Your OTP: ${otp}

This code will expire in 15 minutes.

We're excited to have you join us!

Cheers,  
The Editable Portfolio Team 💼
    `,
  };

  await transporter.sendMail(emailOptions);
};

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if (!userName || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "User with this username and/or email already exists"
    );
  }

  const slug = userName.toLowerCase().replace(/\s+/g, "-");

  const slugExists = await User.findOne({ slug });
  if (slugExists) {
    throw new ApiError(
      409,
      "Username already taken, please choose a different name"
    );
  }

  const user = await User.create({
    userName,
    email,
    password,
    slug,
    isVerfied: false, // Ensure user starts as unverified
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Send verification OTP to user's email
  await sendVerificationOTP(createdUser);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdUser,
        "User registered successfully. Please check your email for verification OTP."
      )
    );
});

// Add this new controller to verify the OTP
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerfied) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Email already verified"));
  }

  if (user.verifyOtp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (user.verifyOtpExpiry < Date.now()) {
    throw new ApiError(400, "OTP has expired");
  }

  // Verify user and clear OTP fields
  user.isVerfied = true;
  user.verifyOtp = "";
  user.verifyOtpExpiry = 0;

  await user.save();

  // Send welcome email after verification
  const welcomeEmailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: `🚀 Welcome aboard, ${user.userName}! Your portfolio journey begins now.`,
    text: `Hi ${user.userName}, 👋
  
Thank you for verifying your email! Your Editable Portfolio account is now fully active.
  
✨ What's next?
Start editing your profile, adding your skills, and building the portfolio that reflects YOU. Everything is customizable – just the way you want it.
Your Profile URL: ${process.env.CORS_ORIGIN}/${user.slug}
  
We're excited to see what you build!
  
Cheers,  
The Editable Portfolio Team 💼
    `,
  };

  await transporter.sendMail(welcomeEmailOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully"));
});

// Add this controller to resend OTP if needed
const resendVerificationOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerfied) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Email already verified"));
  }

  // Send new verification OTP
  await sendVerificationOTP(user);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Verification OTP sent successfully"));
});

/**
 * Controller for initiating password reset process
 * Generates an OTP and sends it to the user's email
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User with this email does not exist");
  }

  // Generate OTP for password reset
  const otp = generateOTP();
  const otpExpiry = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

  // Update user with password reset OTP
  user.resetOtp = otp;
  user.resetOtpExpiry = new Date(otpExpiry);
  await user.save();

  // Send password reset OTP email
  const emailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: `Password Reset - Editable Portfolio`,
    text: `Hi ${user.userName}, 👋
    
We received a request to reset your password for your Editable Portfolio account.

Your Password Reset OTP: ${otp}

This code will expire in 15 minutes.

If you didn't request this password reset, please ignore this email or contact support if you have concerns.

Cheers,  
The Editable Portfolio Team 💼
    `,
  };

  await transporter.sendMail(emailOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset OTP sent to your email"));
});

/**
 * Controller for only verifying the reset OTP
 */
const verifyResetOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Validate request body
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Validate OTP
  if (user.resetOtp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  // Check if OTP has expired
  if (user.resetOtpExpiry < Date.now()) {
    throw new ApiError(400, "OTP has expired. Please request a new one");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        verified: true,
        email: email,
      },
      "OTP verified successfully. You can now reset your password."
    )
  );
});

/**
 * Controller for setting a new password after OTP verification
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  // Validate request body
  if (!email || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  // Password strength validation
  if (newPassword.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if user has a valid reset OTP (ensuring they went through verification)
  if (!user.resetOtp || user.resetOtpExpiry < Date.now()) {
    throw new ApiError(
      400,
      "Invalid or expired verification session. Please restart the password reset process"
    );
  }

  // Update password and clear reset OTP fields
  user.password = newPassword; // This will be hashed via the pre-save hook
  user.resetOtp = "";
  user.resetOtpExpiry = Date.now();

  await user.save();

  // Send password change confirmation email
  const emailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: `Password Changed Successfully - Editable Portfolio`,
    text: `Hi ${user.userName}, 👋
    
Your password has been successfully changed.

You can now log in to your account with your new password.

If you did not make this change, please contact support immediately.

Cheers,  
The Editable Portfolio Team 💼
    `,
  };

  await transporter.sendMail(emailOptions);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset successful. You can now login with your new password."
      )
    );
});

/**
 * Controller to resend the password reset OTP if it expires
 */
const resendResetOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User with this email does not exist");
  }

  // Generate new OTP for password reset
  const otp = generateOTP();
  const otpExpiry = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

  // Update user with new password reset OTP
  user.resetOtp = otp;
  user.resetOtpExpiry = new Date(otpExpiry);
  await user.save();

  // Send new password reset OTP email
  const emailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: `New Password Reset OTP - Editable Portfolio`,
    text: `Hi ${user.userName}, 👋
    
Here is your new password reset OTP for your Editable Portfolio account:

Your Password Reset OTP: ${otp}

This code will expire in 15 minutes.

If you didn't request this password reset, please ignore this email or contact support.

Cheers,  
The Editable Portfolio Team 💼
    `,
  };

  await transporter.sendMail(emailOptions);

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "New password reset OTP sent to your email")
    );
});

export {};

export {
  registerUser,
  updateUser,
  getCurrentUser,
  getUserBySlug,
  removeUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  sendVerifyOtp,
  verifyEmail,
  sendResetOtp,
  resetPassword,
  forgotPassword,
  verifyResetOTP,
  resendResetOTP,
};
