import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors';
import connectDB from './config/connectdb.js'
import userRoutes from './routes/userRoutes.js'

const app = express()
const port = process.env.port
const DATABASE_URL = process.env.DATABASE_URL
//cors policy
app.use(cors())
//load

app.use("/api/user", userRoutes)

//database connection
connectDB(DATABASE_URL)


//json
app.use(express.json())

app.listen(port, ()=>{
    console.log("server is listening on 3400")
})