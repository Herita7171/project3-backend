const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("db is connnected.");
}).catch((exception) => {
    console.log("db connection failed: ", exception);
});