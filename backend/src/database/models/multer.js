import multer from "multer";
import path, { extname } from 'path';
import axios from 'axios';
//import { uploadDir } from "./config.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const uploadDir = path.join(__dirname,  'upload');

/*const storage = multer.diskStorage({
    destination:function (req,file,cb){
        cb(null, uploadDir );
    },
    filename:function(req,file,cb){
        cb(null,`${Date.now()}-${file.originalname}`);
    }
});*/
const storage = multer.memoryStorage();

const upload= multer({
    storage:storage,
    limits:{
        fileSize:10 * 1024 * 1024,
    },
    fileFilter:(req,file,cb)=>{
        const fileTypes=/jpeg|jpg|png|gif/;
        const extname=fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
         
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

export default upload;
