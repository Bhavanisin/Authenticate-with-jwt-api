import userModel from '../models/user.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import transporter from '../config/emailConfig.js'

class userController{
    static userRegistration =  async (req, res) =>{
        const {name, email, password, password_conf, tc} = req.body
        const user = await userModel.findOne({email:email})
        if(user){
        res.send({"status":"failed", "massage":"Email already exists"})
        }else{
            if(name && email && password && password && password_conf && tc){
                if(password === password_conf){
                 try{
                    const salt = await bcrypt.genSalt(15)
                    const hashPassword = await bcrypt.hash(password, salt)
                    const doc = new userModel({
                        name: name,
                        email: email,
                        password: hashPassword,
                        tc: tc

                    })
                    await doc.save()
                    const saved_user = await userModel.findOne({email: email})
                    //Generate JWT Token
                    const token = jwt.sign({userID: saved_user._id }, process.env.JWT_SECRET_KEY,{expiresIn: '10d'})
                    res.status(201).send({"status":"success", "massage":"Registration Success","token": token})



                 }catch(error){
                    console.log(error)
                    res.send({"status":"failed", "massage":"Unable to Register"})

                 }

                }else{
                    res.send({"status":"failed", "massage":"password and confirm password doesn't match"})
                }

            }else{
                res.send({"status":"failed", "massage":"All field are required"})
            }
        }

    }
    
    static userLogin = async (req, res) =>{
        try{
            const {email, password} = req.body
            if(email && password){
                const user = await userModel.findOne({email: email})
                if(user != null){
                    const isMatch = await bcrypt.compare(password, user.password)
                    if(user.email === email && isMatch){
                        //generate token
                        
                    const token = jwt.sign({userID: user._id }, process.env.JWT_SECRET_KEY,{expiresIn: '10d'})
                        res.send({"status":"success", "massage":"Login Success", "token": token})

                    }else{
                        res.send({"status":"failed", "massage":"Email or Password is not valid"})
                    }


                }else{
                    res.send({"status":"failed", "massage":"You are not a Register user"})

                }

            }else{
                res.send({"status":"failed", "massage":"All field are required"})

            }

        }catch(error){
            console.log(error)
            res.send({"status":"failed", "massage":"Unable to login"})
        }
    }
    static changeuserPassword = async (req, res) =>{
        const {password, password_conf} = req.body
        if(password && password_conf){
            if(password !== password_conf){
                res.send({"status":"failed", "massage":"New password and confirm new password doesn't match"})

            }else{
                const salt = await bcrypt.genSalt(15)
                const newhashPassword = await bcrypt.hash(password, salt)
                await userModel.findByIdAndUpdate(req.user._id, {$set:{password: newhashPassword}})
                res.send({"status": "success", "message": "Password changed successfully"})

                
            }

        }else{
            res.send({"status":"failed", "massage":"All field are required"})
        }
    }
    static loggedUser = async(req, res) =>{
        res.send({"user": req.user})


    }

    static sendUserPasswordResetEmail = async (req, res) =>{
        const {email} = req.body
        if(email){
            const user = await userModel.findOne({email: email})
        
            if(user){
                const secret = user._id + process.env.JWT_SECRET_KEY
                const token = jwt.sign({userID: user._id}, secret, {expiresIn: '10m'})
                const link = `http://127.0.0.1:6000/api/user/reset/${user._id}/${token}`

                //send email
                let info = await transporter.sendMail({
                    from:process.env.EMAIL_FROM, 
                    to: user.email,
                    subject: "Bhavani - Password reset link",
                    html:`<a href=${link}>Click Here</a> to Reset your Password`
                })
                res.send({"status": "success", "message": "password Reset Email Sent... Please check your Email",
                "info": info})


            }else{
                res.send({"status": "failed", "message":"Email doesn't exist"})
            }

        }else{
            res.send({"status": "failed", "message": "Email field is Required"})
        }
    }

    static userPasswordReset = async (req, res) =>{
        const {password, password_conf} = req.body
        const {id, token} = req.params
        const user = await userModel.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY
        try{
            jwt.verify(token, new_secret)
            if(password && password_conf){
                if(password !== password_conf){
                    res.send({"status":"failed", "massage":"New password and confirm new password doesn't match"})



                }else{
                    
                const salt = await bcrypt.genSalt(15)
                const newhashPassword = await bcrypt.hash(password, salt)
                await userModel.findByIdAndUpdate(user._id, {$set: {password: newhashPassword}})
                res.send({"status":"success", "massage":"Password Reset Successfully"})




                }
            }else{
                res.send({"status":"failed", "massage":"All field are required"})

            }

        }catch(error){

        }
    
    }
}

export default userController


