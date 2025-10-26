import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { 
    createPost, 
    getAllPosts, 
    getPostById, 
    likePost, 
    commentOnPost, 
    getPostsByHashtag, 
    deletePost 
} from '../controllers/community.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.route('/posts')
    .post(upload.array('images', 4), createPost) // Allow up to 4 images
    .get(getAllPosts);

router.route('/posts/:postId')
    .get(getPostById)
    .delete(deletePost);

router.route('/posts/:postId/like')
    .patch(likePost);

router.route('/posts/:postId/comment')
    .post(commentOnPost);

router.route('/hashtag/:hashtag')
    .get(getPostsByHashtag);

export default router;
