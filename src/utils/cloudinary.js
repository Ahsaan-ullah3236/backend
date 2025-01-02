import { v2 as cloudinary} from "cloudinary";
import fs from 'fs'

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadCloudinary = async (localFilePath) =>{
    try {
        if (!localFilePath) return null 
        // opload the file on cloudinary 
        const response = await cloudinary.uploader.upload(localFilePath, {
            resourse_type: "auto"
        })
        // file has been uploadded on successfully 
        console.log("file is uploaded on cloudinary", response.url);
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporay file as the upload file operation got filed
        return null;
    }
}
export {uploadCloudinary}