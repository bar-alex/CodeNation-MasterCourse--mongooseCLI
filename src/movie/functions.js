const Movie = require("./model");
//Movie.ensureIndexes();

// adds a new movie, or an array of movies
exports.addMovie = async (movieObjOrList) => {
    // todo: when passing an array of objects to create() it drops all properties except title and actors
    try {
        const response = await Movie.create(movieObjOrList)
        const countSource = () => Array.isArray(movieObjOrList) ? movieObjOrList.length : 1;
        console.log(`\naddMovie -> ${ countSource() } movie ${ countSource()==1 ? 'record was' : 'records were' } added:`, response);
    } catch (error) {
        console.log('\nError: ', error);
    }
}


// tests if the movie title exists, and adds the actor to the movie actors, if not just adds the movie
exports.addMovieOrActors = async (movieObj) => {
    try {
        // if there's a record with the same title, it will retrieve it
        const record =  await Movie.findOne( {title: movieObj.title} );
        console.log( '\naddMovieOrActors -> movie record retrieved from db: ', record );

        // if it doesn't exist in db, the it just adds it the normal way
        if( !record )
            await this.addMovie(movieObj);

        else if( movieObj.actors ) {
            //let newActors = record
            record.actors = record
                .actors.replace("Not specified","")
                .split(',')
                .map( it => it.trim() )
                .filter( it => !!it && it.toLowerCase() != movieObj.actors.toLowerCase() )
                .concat(movieObj.actors)
                .join(', ');

            //record.actors = newActors;
            const result = await Movie.findOneAndUpdate( {title: movieObj.title}, record, {new: true} )
            console.log( '\naddMovieOrActors -> actor was added to movie record: ', result );

        } else 
            console.log( "\naddMovieOrActors: No change will be made as title exists and actors wasn't specified" );

    } catch (error) {
        console.log('\nError: ', error);
    }
    
}


// will return a list of movies that begin with the searched text // *text -> for movies that contain "text" anywhere in title
exports.listMovie = async (titleSearch) => {
    try {
        await Movie.ensureIndexes();

        const condText = typeof titleSearch == 'string'
            ? { title: RegExp( (titleSearch.slice(0,1)==='*' ? titleSearch.slice(1) : '^'+titleSearch),'i')} 
            : {};

        const result = await Movie.find( condText ).select('-_id -__v') //.projection({_id:0, __v:0});
        if(result.length>0)
            console.log(`\nlistMovie -> the following (${result.length}) movie records were found: `, result);
        else 
            console.log('\nlistMovie -> no records were returned for the filter: ', condText);

    } catch (error) {
        console.log('\nError: ', error);
    }
}


// will update a movie data with new data // movieObjs must have newTitle [newActors, newOthers..]
// this works, but apparently is not the proper way of doing it
exports.updateMovieByQuery = async (movieTitle, movieObj) => {
    try {
        const updateInstr = { $set: {} };
        if(movieObj.newTitle || movieObj.newMovie) 
            updateInstr['$set'].title = (movieObj.newTitle || movieObj.newMovie);
        if(movieObj.newActors || movieObj.newActor)
            updateInstr['$set'].actors = (movieObj.newActors || movieObj.newActor);
        
        // removes newMovie and newActor if they are set
        delete movieObj['newMovie'], movieObj['newActor']

        //console.log( Object.keys(movieObj) );
        Object.keys(movieObj).map( it => {
            //console.log('building updateInstr: it = ', it, it.slice(0,3));
            if( it.slice(0,3)==='new' && 'newTitle,newActors'.split(',').indexOf(it)==-1 ){
                let field = it.slice(3,4).toLowerCase()+it.slice(4);
                updateInstr['$set'][field] = movieObj[it];
            }
        } )

        // use this to remove fields in the 'drop' list
        if(movieObj.drop){
            updateInstr['$unset'] = {};
            movieObj.drop.split(',').map( (it) => updateInstr['$unset'][it.trim()] = 1 )   //  = movieObj[it]
        }

        //console.log(`\nupdateMovie -> movieTitle: "${movieTitle}"`,'\nmovieObj: ',movieObj,'\nupdateInstr: ', updateInstr);
        
        const updatedDoc = await Movie.findOneAndUpdate( 
                { title: movieTitle }, 
                updateInstr, 
                {   returnNewDocument: true, 
                    new: true, 
                    overwrite: true, 
                    runValidators: true 
                } 
            );
        console.log('\nupdateMovie -> movie record was updated: ', updatedDoc);

    } catch (error) {
        console.log('\nError: ', error);
    }
}


// // will update a movie data with new data // movieObjs must have newTitle [newActors, newOthers..]
// exports.updateMovieByDoc = async (movieTitle, movieObj) => {
//     try {
//         const updateInstr = { $set: {} };
//         if(movieObj.newTitle || movieObj.newMovie) 
//             updateInstr['$set'].title = (movieObj.newTitle || movieObj.newMovie);
//         if(movieObj.newActors || movieObj.newActor)
//             updateInstr['$set'].actors = (movieObj.newActors || movieObj.newActor);
        
//         //console.log( Object.keys(movieObj) );
//         Object.keys(movieObj).map( it => {
//             //console.log('building updateInstr: it = ', it, it.slice(0,3));
//             if( it.slice(0,3)==='new' && 'newTitle,newActors'.split(',').indexOf(it)==-1 ){
//                 let field = it.slice(3,4).toLowerCase()+it.slice(4);
//                 updateInstr['$set'][field] = movieObj[it];
//             }
//         } )

//         if(movieObj.drop)
//             movieObj.drop.split(',').map( (it) => updateInstr['$unset'][field] = movieObj[it] )


//         console.log(`updateMovie -> movieTitle: "${movieTitle}"`,'\nmovieObj: ',movieObj,'\nupdateInstr: ', updateInstr);
        
//         const updateDoc = await Movie.findOne({ title: movieTitle });
//         updateDoc['title'] = (movieObj.newTitle || movieObj.newMovie) ;
//         delete updateDoc['actor'];
//         delete updateDoc['actors'];
//         await updateDoc.save();
//         console.log('\nupdateMovie -> movie record was updated: ', updateDoc);

//         // const updatedDoc = await Movie.findOneAndUpdate( { title: movieTitle } );
//         //         { title: movieTitle }, 
//         //         updateInstr, 
//         //         { returnNewDocument: true, new: true } 
//         //     );
//         // console.log('\nupdateMovie -> movie record was updated: ', updatedDoc);

//     } catch (error) {
//         console.log('\nError: ', error);
//     }
// }




// will delete the movie(s) that begin with the text // if *text -> movies that contain text anywhere in title
exports.deleteMovies = async (titleSearch) => {
    try {
        //const query = ( !!movieObj ? {$search {$title: movieObj.title}} : {} );
        const whereCond = !!titleSearch 
            ? { title: RegExp( (titleSearch.slice(0,1)==='*' ? titleSearch.slice(1) : '^'+titleSearch),'i')} 
            : {};
            
        const result = await Movie.deleteMany( whereCond ); // returns {deletedCount: x} where x is the number of documents deleted.
        console.log(`\ndeleteMovies -> ${result.deletedCount} movie ${result.deletedCount==1?'record was':'records were'} deleted.`);

    } catch (error) {
        console.log('\nError: ', error);
    }
}