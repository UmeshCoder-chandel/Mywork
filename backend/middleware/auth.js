import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import dotenv from "dotenv";
dotenv.config();

const auth = async (req,res,next) => {
    try {
        console.log("auth middleware");
console.log(req.cookies);

        
        const token = req.cookies.access_token || req.headers.authorization && req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "No token access"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        if(!decoded){
            return res.status(401).json("invalid token")
        }
         const user = await User.findById(decoded.userId).select('-password')
       if(!user){
        return res.status(400).json("user not found")
       }
       console.log(user);
       
       req.user=user;
         next();
                  

    } catch (error) {
        console.log("auth.js page",error);
        
        res.status(401).json({
            message: "Unauthorized access"
        });
    }
    
}

export default auth;