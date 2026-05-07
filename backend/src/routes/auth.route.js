import express from "express"

import { login, signup, logout, getUserInfo } from "../controllers/auth.controller.js"
import { requireRole } from "../middlewares/roleMiddleware.js"

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', requireRole('learner', 'faculty', 'operator', 'admin', 'finance'), logout)
router.get('/user-info', requireRole('learner', 'faculty', 'operator', 'admin', 'finance'), getUserInfo)

export default router