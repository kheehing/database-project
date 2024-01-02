const express = require('express');
const app = express();
const port = 8080;
const sqlite3 = require('sqlite3').verbose();

//items in the global namespace are accessible throught out the node application
global.db = new sqlite3.Database('./database.db',function(err){
    if(err){
      console.error(err);
      process.exit(1); //Bail out when can't connect to the DB
    }else{
      console.log("Database connected");
      global.db.run("PRAGMA foreign_keys=ON"); //SQLite to pay attention to foreign key constraints
    }
  });

//set the app to use ejs for rendering
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render("index");
  });

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });