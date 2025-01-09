import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUNDINARY_NAME,
    api_key: process.env.CLOUNDINARY_API_KEY,
    api_secret: process.env.CLOUNDINARY_SERCET_KEY
});

const cloudinaryUpload = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log(`File successfully uploaded on cloudiary ${response.url}`);
        return response
    } catch (error) {
        console.log(`Failed to upload !! ${error}`);
        fs.unlinkSync(localFilePath);
        return null
    }
}

export { cloudinaryUpload }