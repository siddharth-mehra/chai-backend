
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
        // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET,})
    
    const uploadonCloudinary = async (filePATH) => {
        try{
            if(!filePATH){
                return null;
            }
            
                // upload the file on cloudinary
                const res=await cloudinary.uploader.upload(filePATH,{
                    resource_type:'auto'
                })
              
                // file uploaded successfully
                console.log('file uploaded successfully',res.url);
                return res;
            }catch(error){
                fs.unlinkSync(filePATH);//remove the locally saved 
                // temporary file as the upload operation failed
                return null;
            }   
        }
     
    
    export {uploadonCloudinary} 

