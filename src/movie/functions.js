const Movie = require("./model");
//Movie.ensureIndexes();


// adds a new movie, or an array of movies
exports.addMovie = async (movieObjOrList) => {
    try {
        let movieOrList // will hold the changed movieObjOrList
        // normalize the actors -- for all objects in the array
        if( Array.isArray(movieObjOrList) )
            movieOrList = movieObjOrList.map( it => 
                (!!movieObjOrList.actors && typeof it.actors === "string")
                ? it.actors.split(',').map( ik => ik.trim()).join(',')
                : it )
        else                 // -- or just for the object
            movieOrList = {...movieObjOrList};
            movieOrList.actors = 
                (!!movieObjOrList.actors && typeof movieObjOrList.actors === "string")
                ? movieObjOrList.actors.split(',').map( it => it.trim() ).join(', ')
                : movieObjOrList.actors

        // add the array or the object to the collection
        const response = await Movie.create(movieOrList);

        const countSource = () => Array.isArray(movieOrList) ? movieOrList.length : 1;
        console.log(`\n->addMovie -> ${ countSource() } movie ${ countSource()==1 ? 'record was' : 'records were' } added:`, response);

    } catch (error) {
        console.log('\n->Error: ', error);
    }
}


// tests if the movie title exists, and adds the actor to the movie actors, if not just adds the movie
exports.addMovieOrActors = async (movieObj) => {
    try {
        // if there's a record with the same title, it will retrieve it
        const record =  await Movie.findOne( {title: movieObj.title} ).select('-_id -__v');
        console.log( '\n->addMovieOrActors -> movie record retrieved from db: ', record );

        // if it doesn't exist in collection, then it just adds it the normal way
        if( !record )
            await this.addMovie(movieObj);

        else if( movieObj.actors && typeof movieObj.actors === "string" ) {
            
            //cleanup actors from incoming object
            movieObj.actors = (movieObj.actors && typeof movieObj.actors === "string")
                ? movieObj.actors.split(',').map( it => it.trim() ).join(', ')
                : movieObj
            
            //make a distinct list of the actors from the record object + the movieObj
            record.actors = record.actors
                .replace("Not specified","")
                .split(',')
                .map( it => it.trim() )
                .filter( it => !!it && movieObj.actors  //filter out the actors that are the same
                        .toLowerCase()
                        .split(',')
                        .map( it=>it.trim() )
                        .indexOf( it.toLowerCase() )==-1 )
                .concat(movieObj.actors)
                .join(', ');

            // Todo: seems that the proper way of saving this would be record.save()
            const result = await Movie.findOneAndUpdate( {title: movieObj.title}, record, {new: true} ).select('-_id -__v');
            console.log( '\n->addMovieOrActors -> actor was added to movie record: ', result );

        } else 
            console.log( "\n->addMovieOrActors: No change will be made as title exists and actors wasn't specified" );

    } catch (error) {
        console.log('\n->Error: ', error);
    }
    
}


// will return a list of movies that begin with the searched text // *text -> for movies that contain "text" anywhere in title
exports.listMovie = async (titleSearch) => {
    try {
        // solves the dangling reference issue after the find() call -- but why?
        await Movie.ensureIndexes();

        const condText = (!!titleSearch && typeof titleSearch === 'string')
            ? { title: RegExp( (titleSearch.slice(0,1)==='*' ? titleSearch.slice(1) : '^'+titleSearch),'i')} 
            : {};

        const result = await Movie.find( condText ).select('-_id -__v') //.projection({_id:0, __v:0});

        if(result.length>0)
            console.log(`\n->listMovie -> the following (${result.length}) movie records were found: `, result);
        else 
            console.log('\n->listMovie -> no records were returned for the filter: ', condText);

    } catch (error) {
        console.log('\n->Error: ', error);
    }
}


// will delete the movie(s) that begin with the text // if *text -> movies that contain text anywhere in title
exports.deleteMovies = async (titleSearch) => {
    try {

        const whereCond = (!!titleSearch && typeof titleSearch === "string")
            ? { title: RegExp( (titleSearch.slice(0,1)==='*' ? titleSearch.slice(1) : '^'+titleSearch),'i')} 
            : {};

        const result = await Movie.deleteMany( whereCond ); // returns {deletedCount: x} where x is the number of documents deleted.
        console.log(`\n->deleteMovies -> ${result.deletedCount} movie ${result.deletedCount==1?'record was':'records were'} deleted.`);

    } catch (error) {
        console.log('\n->Error: ', error);
    }
}


// will update a movie data with new data // movieObjs must have newTitle [newActors, newOthers..]
// this works, but apparently is not the proper way of doing it, i should get the object, change it, then call .save() on it
exports.updateMovieByQuery = async (movieTitle, movieObj) => {
    try {

        const updateInstr = { $set: {} };

        // turns newTitle, newMovie into newTitle
        if(movieObj.newTitle || movieObj.newMovie) 
            updateInstr['$set'].title = (movieObj.newTitle || movieObj.newMovie);
        // turns newActors, newActor into newActors
        if(movieObj.newActors || movieObj.newActor)
            updateInstr['$set'].actors = 
                (movieObj.newActors || movieObj.newActor)
                .split(',').map( it=>it.trim() ).join(', ');
        
        // removes newMovie and newActor if they exist, the proper pair is newTitle and newActors
        delete movieObj['newMovie'], movieObj['newActor']

        //scan the newObj keys to build the $set instruction
        Object.keys(movieObj).map( it => {
            //adds every newKey to the $set instruction
            if( it.slice(0,3)==='new' && 'newTitle,newActors'.split(',').indexOf(it)==-1 ){
                let field = it.slice(3,4).toLowerCase()+it.slice(4);
                updateInstr['$set'][field] = movieObj[it];
            }
        } )

        // use this to remove fields in the 'drop' list, it adds them to the $unset instruction
        if(movieObj.drop){
            updateInstr['$unset'] = {};
            movieObj.drop.split(',').map( (it) => updateInstr['$unset'][it.trim()] = 1 )
        }

        console.log(`\n->updateMovie -> movieTitle: "${movieTitle}"`,
            '\n->movieObj: ',movieObj,
            '\n->updateInstr: ', updateInstr);
        
        const updatedDoc = await Movie.findOneAndUpdate( 
                { title: movieTitle }, 
                updateInstr, 
                {   returnNewDocument: true, 
                    new: true, 
                    overwrite: true, 
                    runValidators: true 
                } 
            ).select('-_id -__v');
        console.log('\n->updateMovie -> movie record was updated: ', updatedDoc);

    } catch (error) {
        console.log('\n->Error: ', error);
    }
}


// will update a movie data with new data // movieObjs must have newTitle [newActors, newOthers..]
// the right way, is meant to be, is to get the document, make changes to it, then save it
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
