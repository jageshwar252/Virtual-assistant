import express from 'express'
import { signUp, logout, login } from '../controllers/auth.controller.js';

const authRoutes = express.Router();

authRoutes.post('/signup', signUp);
authRoutes.post('/login', login);
authRoutes.get('/logout', logout);

export default authRoutes;