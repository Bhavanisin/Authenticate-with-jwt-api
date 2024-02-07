import  Jwt  from 'jsonwebtoken'
import userModel from '../models/user.js'


var checkUserAuth = async(req,res, next) =>{
    let token 
    const {auhorization} = req.headers
    if(auhorization && auhorization.startswith('bearer')){
        try{
            //get user from header
            token = auhorization.split()[1]

            //verify token
            const {userID} = Jwt.verify(token, process.env.JWT_SECRET_KEY)

            //Get User from Token
            req.user = await userModel.findById(userID).select('-password')
            next()

        }catch(error){
            console.log(error)
            res.status(401).send({"status": "failed", "massage": "Unauthourized User"})

        }
    }
    if(!token){
        res.status(401).send({"status": "failed", "massage": "Unauthourized User"})


    }
}

export default  checkUserAuth