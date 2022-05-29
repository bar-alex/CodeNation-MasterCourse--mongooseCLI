# CodeNation-MasterCourse--mongooseCLI

A command line interface (CLI) tool, powered by nodeJS, that can be used to manage a movie database.
It uses Yargs, dotEnv and mongoose on a mongoDB backend. 
It accepts flexible arguments for CRUD operations, adding and removing fields.

---

- Create an `.env` file in the root folder that has to contain something similar to this:

`MONGO_URI = mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/m37movies?retryWrites=true&w=majority`
- You can get your own by creating an Atlas account at [https://www.mongodb.com/](https://www.mongodb.com/)
- Run `npm install` to install all dependencies. 

---
Once everything is installed, run 

`node src/app.js --info` to get the help information and 

`node src/app.js --sample` to get the db filled with some sample data

This is the full list of the available commands:

```
The following commands can be used:
   node src/app.js <options>

These are the options:
   --add --title <movieTitle> [--actors <actors>]
   --add --movie <movieTitle> [--actors <actors>]
   --add <movieTitle> [--actors <actors>]
   --list
   --list <movieTitle>
   --list <*filter>
   --update --movie <movieTitle> [--newTitle <newMovieTitle> --newActors <newActorNames>, --newWhatever <whatevs>]
   --update <movieTitle> [--drop <field1,field2,fieldN>]
   --delete --title <movieTitle>
   --delete <movieTitle>
   --delete <*filter>
   --sample, --demo
   --purge

--add: adds movie(s), if the movie exists, it adds the new actors to it
--list: lists movies (prefix text with "*" for matching records with 'text' wherever in title)
--update: changes the value of properties (can also add new properties or delete existent ones with drop)
--delete: erases documents (prefix text with "*" for partial search of text in title)
--purge: erases all records
--sample/demo: adds a bunch of records with sample data
--info: will display this text
```
