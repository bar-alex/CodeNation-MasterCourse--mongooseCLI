const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: true,
        index: true,
    },
    actors: {
        type: String,
        default: "Not specified",
    },
    rating: {
        type: Number,
        min: [1,"Has to be a least 1"],
        max: [5,"Can't be higher than 5"],
        index: true,
    }
}, {
    strict: false,
    collation: { locale: 'en_US', strength: 1 },
});

//movieSchema.index({  })

const Movie = mongoose.model("Movie", movieSchema);
// Movie.ensureIndexes();

// Movie.syncIndexes()
// Movie.listIndexes( (it) => console.log('model -> listIndexes: ', it ) );

module.exports = Movie;
