import express from "express"

import { login, signup, logout, getUserInfo } from "../controllers/auth.controller.js"
import { protectedRoute } from "../middlewares/protectedroute.js"

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)
router.get('/user-info', protectedRoute, getUserInfo)

export default router