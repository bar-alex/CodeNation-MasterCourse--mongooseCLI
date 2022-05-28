require("dotenv").config();
const mongoose = require("mongoose");

(async () => {
    try {
        mongoose.connection
            .on('error', console.error.bind(console, '->Connection error:'))
            .once('open', () => console.log('\n->Successfully connected!'));
        await mongoose.connect(process.env.MONGO_URI)
        // await mongoose.set('debug', true);
        // await mongoose.set('debug', function(collectionName, methodName, ...methodArgs) { console.log(`->Mongoose: ${collectionName}.${methodName}(${methodArgs.join(', ')})`); });
        // await mongoose.set('bufferCommands', false);
        //console.log("Successfully connected");
        // Movie.ensureIndexes();


    } catch (error) {
        console.log("->Error connecting: ", error);
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
