import { asynchandler } from "../utils/asynchandlers.js";
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";
import { response } from "express";

const rejisterUser = asynchandler(async (req, res) => {
    // get userDeatils from frontend 
    // validation 
    // check if user already exists: username ,emial
    // check for images ,check for avatar 
    // upload them to cloudinary ,avatar
    //create userobject - create entry in db
    // remove password and refresh token field from response 
    // check for user creation 
    // return res


    const { fullName, email, username, password } = req.body
    // console.log("email: ", email);

    // this is if and the under if is same but in this if we checked ony by one and those if we checked all in one 


    // if (fullName==="") {
    //     throw new apiError(400, " fullname is required")
    // }
    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required ")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email },]
    })

    if (existedUser) {
        throw new apiError(409, "User with email or username is alredy exists")
    }
    // console.log(req.files);


    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.
        coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files?.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new apiError(400, " Avatar image is required")
    }

    const avatar = await uploadCloudinary(avatarLocalPath)
    const coverImage = await uploadCloudinary
        (coverImageLocalPath)
    if (!avatar) {
        throw new apiError(400, " Avatar image is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select(
        "-password  -refreshToken"
    )

    if (!createdUser) {
        throw new apiError(500, "Something went wrong while rejistring the user ")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, " User Rejistered Successfully")
    )
})

export {
    rejisterUser,
}