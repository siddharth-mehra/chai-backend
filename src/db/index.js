import mongoose from "mongoose";

const connectdb = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.name}`);
    }catch(error){  
        console.log(error);
        process.exit(1);
    }   
}

export default connectdb