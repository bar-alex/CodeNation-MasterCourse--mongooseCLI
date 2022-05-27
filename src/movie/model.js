const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: true,
    },
    actor: {
        type: String,
        default: "Not specified",
    }
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
