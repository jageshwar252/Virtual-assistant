import getToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signUp = async(req, res) => {

    const { name, email, password } = req.body;

    try {

        const emailExist = await User.findOne({ email });
        if(emailExist){
            return res.status(400).json({ message: "Email already exists" });
        };
        if(password.length < 6){
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const hashPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            name,
            password: hashPassword,
            email
        })

        const token = await getToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
            sameSite: "Strict",
            secure: false
        })

        res.status(201).json(user);

    } catch(error){
        res.status(500).json({ message: error.message });
    }
}

export const login = async(req, res) => {

    const { email, password } = req.body;

    try {

        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: "Email does not exist" });
        };
        
        const pass = await bcrypt.compare(password, user.password);

        if(!pass){
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = await getToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
            sameSite: "Strict",
            secure: false
        })

        res.status(201).json(user);

    } catch(error){
        res.status(500).json({ message: `login error ${error.message}` });
    }
}

export const logout = async(req, res) => {

    try {
        res.clearCookie("token");
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: `Logout error ${error.message}` });
    }
}