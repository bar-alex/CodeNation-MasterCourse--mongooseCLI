const Movie = require("./model");


// adds a new movie
exports.addMovie = async (movieObj) => {
    try {
        const response = await Movie.create(movieObj)
        console.log('1 record was added:', response);
    } catch (error) {
        console.log('Error: ', error);
    }
}


// tests if the movie title exists, and adds the actor to the movie actors, if not just adds the movie
exports.addMovieOrActor = async (movieObj) => {

}


// will return a list of movies that begin with the searched text // *text -> for movies that contain "text" anywhere in title
exports.listMovie = async (titleSearch) => {
    try {
        //const query = ( !!movieObj ? {$search {$title: movieObj.title}} : {} );
        const query = typeof titleSearch == 'string'
            ? { title: RegExp( (titleSearch.slice(0,1)==='*' ? titleSearch.slice(1) : '^'+titleSearch),'i')} 
            //? { "title": { "$regex": "^"+titleSearch.slice(1), "$options": "i" } }
            : {};
            
        const result = await Movie.find( query ).exec();
        //await Kitten.find({ name: /^fluff/ });
        console.log(result);

    } catch (error) {
        console.log('Error: ', error);
    }
}


// will update a movie data with new data
exports.updateMovie = async (movieTitle, newTitle) => {


}


// will delete the movie(s) that begin with the text // if *text -> movies that contain text anywhere in title
exports.deleteMovies = async (titleSearch) => {
    try {
        //const query = ( !!movieObj ? {$search {$title: movieObj.title}} : {} );
        const query = !!titleSearch 
            ? { title: RegExp( (titleSearch.slice(0,1)==='*' ? titleSearch.slice(1) : '^'+titleSearch),'i')} 
            //? { "title": { "$regex": "^"+titleSearch.slice(1), "$options": "i" } }
            : {};
            
        //const result = await Movie.find( query );
        const result = await Movie.deleteMany( query ); // returns {deletedCount: x} where x is the number of documents deleted.
        //await Kitten.find({ name: /^fluff/ });
        console.log(`${result.deletedCount} records were deleted.`);

    } catch (error) {
        console.log('Error: ', error);
    }
}