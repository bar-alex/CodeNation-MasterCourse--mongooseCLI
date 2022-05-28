require('./db/connection');
const yargs = require('yargs');
const mongoose = require("mongoose");
const { addMovie, addMovieOrActors, listMovie, deleteMovies, updateMovieByQuery } = require('./movie/functions');

const app = async (yargsObj) => {
    
    console.log('app->yargsObj:', yargsObj);

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
        // 'string,number'.split(',').indexOf( typeof yargsObj[key] ) != -1 
        if( typeof yargsObj[key] != 'boolean' && 'add,list,update,delete,purge,demo,sample,$0,_'.split(',').indexOf(key)==-1 )
            movieObj[key] = yargsObj[key];
    } );

    // turn actor into actors if actor was specified but not actors
    if(movieObj.actor && !movieObj.actors) {
        movieObj.actors = movieObj.actor;
        delete movieObj.actor;
    }
    if(movieObj.newActor && !movieObj.newActors) {
        movieObj.newActors = movieObj.newActor;
        delete movieObj.newActor;
    }

    console.log('app->movieObj: ', movieObj, '\n' );

    if (yargsObj.add){
        // add the movie if there's a title
        if( movieObj.title )
            await addMovieOrActors( movieObj );
        else 
            console.log('Command si invalid for adding a movie, movieObj: ', movieObj);

    } else if (yargsObj.list) {
        // todo: fix the lag issue after the listing is done
        // find movies -- giving it no value will list all
        await listMovie( movieObj.title ) ;  //yargsObj.title

    } else if (yargsObj.update) {
        //update a movie
        // return true if there are keys that start with 'new': newTitle, newActors, newWhatever
        const hasNewKeys = () => Object.keys(movieObj)
            .filter( it => it.slice(0,3).toLowerCase()==='new' )
            .length > 0;
        //console.log('app -> update branch -> hasNewKeys: ', hasNewKeys());
        //if( movieObj.title && (movieObj.newTitle || movieObj.newActors) )
        if( movieObj.title && (hasNewKeys() || typeof movieObj.drop == 'string') )
            await updateMovieByQuery( movieObj.title, movieObj )
        else 
            console.log('Command si invalid for updating movies, movieObj: ', movieObj);

    } else if (yargsObj.delete) {
        //delete a movie
        if( movieObj.title )
            await deleteMovies( movieObj.title )
        else 
            console.log('Command si invalid for deleting movies, movieObj: ', movieObj);

    } else if (yargsObj.sample || yargsObj.demo) {
        // add some sample movies to the database
        console.log('Sample data will be added');
        const movieList = [
            {title: "Spiderman", actors: "Tom Holland", rating: 1},
            {title: "Spiderman 2", actors: "Andrew Garfield", crossover: true},
            {title: "Antman", actors: "Paul Rudd, Evangeline Lilly, Michael Douglas", rating:3, crossover: false},
            {title: "Aquaman", actors: "Jasona Momoa", rating: 3},
            {title: "Alien Ant Farm", actors: "Michael Jackson", world: "earth33", genre: "horror/fantasy"},
            {title: "My life", actors: "Myself", ending: undefined},
            {title: "The unknown actor", rating: 13}
        ];
        await addMovie( movieList );

    } else if (yargsObj.purge) {
        // purge all data from the database
        await deleteMovies( '*' )
        console.log('All data has been purged');

    } else {
        console.log("Incorrect command");
    }

    // disconnect in 20 milliseconds
    setTimeout( async () => { 
        await mongoose.disconnect(); 
        //await mongoose.connection.close()
        console.log('Disconnecting mongoose');
    }, 20);
    
}


const showHelpInfo = () => {
    const helpText = [
        "The following commands can be used:",
        "   node src/app.js <options>",
        "These are the options:",
        "   --add --title <movieTitle> [--actors <actors>]",
        "   --add --movie <movieTitle> [--actors <actors>]",
        "   --add <movieTitle> [--actors <actors>]",
        "   --list",
        "   --list <movieTitle>",
        "   --list <*filter>",
        "   --update --movie <movieTitle> [--newTitle <newMovieTitle> --newActors <newActorNames>, --newWhatever <whatevs>]",
        "   --update <movieTitle> [--drop <field1,field2,fieldN>]",
        "   --delete --title <movieTitle>",
        "   --delete <movieTitle>",
        "   --delete <*filter>",
        "   --sample, --demo",
        "   --purge",
        "add - adds, list - lists, update - changes, delete - deletes, sample/demo - fills with sample data, purge - erases all"
    ]
    console.log(helpText.join('\n'));
    mongoose.disconnect(); 
}


if(yargs.argv.info || yargs.argv.helptext)
    showHelpInfo()
else 
    app(yargs.argv)
        .catch( err => console.log('App error: ',err) );


//  node src/app.js --list
//  node src/app.js --add --title "Alien Ant Farm" --actors "Michael Jackson"
//  node src/app.js --update --title "Alien Ant Farm" --newTitle "Ant Farm, The Alien" --newActors "The Jacksons of Michael"
//  node src/app.js --delete --title "Ant Farm, The Alien"
