require("dotenv").config();
const mongoose = require("mongoose");

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Successfully connected");
    } catch (error) {
        console.log("Error connecting: ", error);
    }
})()


// const connection = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI)
//         console.log("Successfully connected");
//     } catch (error) {
//         console.log(error);
//     }
// };

//connection();
