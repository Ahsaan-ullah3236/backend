import { asynchandler } from "../utils/asynchandlers.js";

const rejisterUser = asynchandler ( async (req,res) =>{
    res.status(200).json({
        message: "ok"
    })
})

export {
    rejisterUser,
}

// get userDeatils from frontend 
    // validation 
    // check if user already exists: username ,emial
    // check for images ,check for avatar 
    // upload them to cloudinary ,avatar
    //create userobject - create entry in db
    // remove password and refresh token field from response 
    // check for user creation 
    // return res