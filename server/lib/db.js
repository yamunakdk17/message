// import mongoose from "mongoose";

// // Function to connect to the MongoDB database
// export const connectDB = async () => {
//     try {
//         mongoose.connection.on("connected", () => {
//             console.log("Database Connected");
//         });

//         await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
//     } catch (error) {
//         console.log(error);
//     }
// };

import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("✅ Database Connected");

    } catch (error) {
        console.log("❌ MongoDB Error:");
        console.log(error.message);
    }
};