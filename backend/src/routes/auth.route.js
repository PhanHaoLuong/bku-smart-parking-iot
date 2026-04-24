import express from "express"

import { login, signup, logout, getUserInfo } from "../controllers/auth.controller.js"

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)
router.get('/user-info', getUserInfo)

export default router