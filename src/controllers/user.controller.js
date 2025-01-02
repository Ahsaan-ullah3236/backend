import { asynchandler } from "../utils/asynchandlers.js";

const rejisterUser = asynchandler ( async (req,res) =>{
    res.status(200).json({
        message: "ok"
    })
})

export {
    rejisterUser,
}