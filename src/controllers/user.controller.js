import { asynchandler } from "../utils/asynchandlers.js";
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";
// import { response } from "express";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new apiError(500, "Something went wrong while generating referesh and access token")
    }
}

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

const loginUser = asynchandler(async (req, res) =>{
    // req boyd -> data 
    // username or emial 
    // find the user 
    // password check 
    // access and refresh token 
    // send cokie 

    const {email, username, password} = req.body

    if (!username && !email )  {
        throw new apiError (400, "Username or the Password is required")
    }


    const user = User.findOne({
        $or: [{username} , {email}]
    })
    if (!user) {
        throw new apiError (400, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect
    (password)
    if (!isPasswordValid) {
        throw new apiError (401, "Invalid user credentials")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asynchandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asynchandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new apiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify( 
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new apiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new apiResponse(    
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asynchandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new apiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new apiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asynchandler(async(req, res) => {
    return res
    .status(200)
    .json(new apiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateAccountDetails = asynchandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new apiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asynchandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new apiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asynchandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new apiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new apiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse(200, user, "Cover image updated successfully")
    )
})







export {
    rejisterUser,
    loginUser,
    logoutUser, 
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
}