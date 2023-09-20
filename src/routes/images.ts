import express from "express";
import { acceptChunk, acceptChunkMobile } from "../controllers/images";
import multer from 'multer';

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, __dirname + '/tmp/my-uploads')
    },
    filename(req, file, cb) {
        const ext = file.originalname.substr(file.originalname.lastIndexOf('.') + 1);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext)
    }
})

const upload = multer({
    storage,
    limits: { fieldSize: 2 * 1024 * 1024 }
})

const multipleUpload = upload.any()

const router: express.Router = express.Router()

router.route('/c').post(multipleUpload, acceptChunk)
router.route('/m').post(multipleUpload, acceptChunkMobile)
// router.route('/count').get(getUserCount)
// router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)
// router.route('/product').get(getProducts).post(createProduct)// .patch(updateProduct).delete(deleteUser)
// router.route('/product/id').get(getProduct)
export default router;