import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import config from '../config';
import { ICloudinaryResponse, IFile } from '../app/interface/file';

// Configuration
cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret 
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), 'uploads'));
    },
    filename: function (req, file, cb) {
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        //   cb(null, file.fieldname + '-' + uniqueSuffix)
        cb(null, file.fieldname);
    }
});

const upload = multer({ storage: storage });

const uploadToCloudinary = async (file: IFile) : Promise<ICloudinaryResponse | undefined> => {

    return new Promise((resolve, rejects) => {
        cloudinary.uploader.upload(
            file.path,
            (error: Error, result: ICloudinaryResponse) => {
                fs.unlinkSync(file.path); // Delete the file after upload
                if (error) {
                    rejects(error);
                } else {
                    resolve(result);
                }
            }
        );
    });
};

export const fileUploader = {
    upload,
    uploadToCloudinary
};
