import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
      throw new ApiError(400, "Unauthorized request");
    }

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(400, "Invalid AccessToken");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid AccessToken");
  }
});

export { verifyJWT };



// const verifyJWTl = async (req, res, next)=>{

//   const {token} = req.cookies;

//   if(!token){
//     return res.json({success: false, message: 'Not Authorized. Login Again'});

//   }

//   try {

//     const tokenDecode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//     if(tokenDecode.id){
//       req.body.userId = tokenDecode.id
//     }else{
//       return res.json({success: false, message: 'Not Authorized. Login Again'});
//     }

//     next();
  
//   } catch (error) {
//     res.json({success:false, message: error.message});
//   }

// }

// export default verifyJWTl;

