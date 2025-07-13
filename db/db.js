import mongoose from "mongoose"

export const connectdb = async()=>{
    mongoose.connect(process.env.mongoose_uri,{dbName:"jobhawk"}).then(()=>{
        console.log("Database connected successfully")
    }).catch((error)=>{
        console.log("Error in connecting to database", error.message)
    })
} 