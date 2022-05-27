require('./db/connection');
const yargs = require('yargs');
const mongoose = require("mongoose");
const { addMovie, listMovie, deleteMovies } = require('./movie/functions');

const app = async (yargsObj) => {
    
    console.log('yargs object:', yargsObj);

    // create my own movie object with custom properties and some normalization
    // only to pass on the data to the addMovie/lostMovie/updateMovie/deleteMovie functions
    const movieObj = {};
    movieObj.title = 
        typeof yargsObj.title  === 'string' ? yargsObj.title :      // can be --title "movie title"
        typeof yargsObj.movie  === 'string' ? yargsObj.movie :      // can be --movie "movie title"
        typeof yargsObj.add    === 'string' ? yargsObj.add :        // can be --add "movie title"
        typeof yargsObj.list   === 'string' ? yargsObj.list :       // can be --list "movie title / *movie title"
        typeof yargsObj.update === 'string' ? yargsObj.update :     // can be --update "movie searched for" --newTitle "new movie title"
        typeof yargsObj.delete === 'string' ? yargsObj.delete :     // can be --delete "movie title / *movie title"
        undefined;
    
    // transfer extra properties to the movie object
    Object.keys( yargsObj ).map( (key) => {
        if( typeof yargsObj[key] === 'string' && 'add,list,update,delete,$0'.split(',').indexOf(key)==-1 )
            movieObj[key] = yargsObj[key];
    } );

    console.log('movieObj: ', movieObj );


    if (yargsObj.add){
        // todo: test if title exists, if it exists then switch test if actor is different, in which case add the actor to the other actors of the movie
        //add movie to database from args input

        // add the movie of there's a title
        if( movieObj.title )
            await addMovieOrActor( movieObj );
        else 
            console.log('Command si invalid for adding a movie, movieObj: ', movieObj);

    } else if (yargsObj.list) {
        // todo: fix the lag issue after the listing is done
        // find movies -- giving it no value will list all
        await listMovie( movieObj.title ) ;  //yargsObj.title

    } else if (yargsObj.update) {
        //update a movie
    } else if (yargsObj.delete) {
        //delete a movie
        if( movieObj.title )
            await deleteMovies( movieObj.title )
        else 
            console.log('Command si invalid for listing movies, movieObj: ', movieObj);
        
    } else {
        console.log("Incorrect command");
    }

    // disconnect in 20 milliseconds
    setTimeout( async () => { 
        await mongoose.disconnect(); 
        console.log('disconnecting mongoose');
    }, 20);
    
}

app(yargs.argv);
