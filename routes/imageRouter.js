import express from 'express'

const imageRouter = express.Router()
import {uploadImageFromS3, deleteImageFromS3} from "../controllers/imageController.js";
import protect from "../middleware/authMiddleware.js";

imageRouter.route('/profile/:bucket').post(uploadImageFromS3);

imageRouter.route('/:bucket').post(protect, uploadImageFromS3);

imageRouter.route('/:bucket/:fileName').delete(protect, deleteImageFromS3);

export default imageRouter;