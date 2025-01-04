import { asynchandler } from "../utils/asynchandlers.js";

const rejisterUser = asynchandler ( async (req,res) =>{
    // get userDeatils from frontend 
    // validation 
    // check if user already exists: username ,emial
    // check for images ,check for avatar 
    // upload them to cloudinary ,avatar
    //create userobject - create entry in db
    // remove password and refresh token field from response 
    // check for user creation 
    // return res


    const  {fullName, email,username, password} = req.body
    console.log("email", email);
})

export {
    rejisterUser,
}