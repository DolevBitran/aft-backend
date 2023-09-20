import express from "express";
import passport from "passport";
import { authenticateToken, googleAuthenticationCallback, redirectGoogleOAuth, refreshAccessToken } from "../controllers/auth";


const router: express.Router = express.Router()

router.get("/google/login", googleAuthenticationCallback)
router.post("/token", refreshAccessToken);
router.get('/me', authenticateToken, (req: express.Request, res: express.Response) => {
    res.status(201).json({ success: true, user: req.user })
})

export default router;


// router.get("/google", redirectGoogleOAuth);
// router.get("/protected", authenticateToken, (req, res) => {
//     res.send('test')

// const checkAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
//     console.log(JSON.stringify(req.session))
//     if (!req.user) {
//         res.redirect("/auth/google");
//         console.log('no user')
//     } else {
//         next();
//     }
// };