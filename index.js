const express = require('express');
const app = express();
const port = 8080;
const sqlite3 = require('sqlite3').verbose();
const csvParser = require('csv-parser');
const fs = require('fs');

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

app.get("/get-latest-data", (req, res) => {
  // Fetch data from all three tables
  db.all("SELECT * FROM countries", [], (err, countries) => {
      if (err) {
          console.error(err);
          res.json({ error: "Error fetching countries" });
          return;
      }

      db.all("SELECT * FROM indicators", [], (err, indicators) => {
          if (err) {
              console.error(err);
              res.json({ error: "Error fetching indicators" });
              return;
          }

          db.all("SELECT * FROM yearly_data", [], (err, yearly_data) => {
              if (err) {
                  console.error(err);
                  res.json({ error: "Error fetching yearly data" });
              } else {
                  res.json({ countries, indicators, yearly_data });
              }
          });
      });
  });
});

app.post("/import-csv", (req, res) => {
  const csvFilePath = './data/world development indicators.csv';

  fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (row) => {
        // ##############################################
        // ############## Insert Countries ##############
        // ##############################################

        const countryCode = row['Country Code'];
        const countryName = row['Country Name'];

        // Skip the row if countryCode or countryName is empty
        if (!countryCode || !countryName) {
          console.log("Skipping empty row");
          return;
        }

        // Check if the country already exists in the database
        const checkQueryC = `SELECT * FROM countries WHERE CountryCode = ? OR CountryName = ?`;
        db.get(checkQueryC, [countryCode, countryName], (err, result) => {
            
            if (err) {
                console.error("Error checking for existing country: ", err);
                return;
            }

            // If the country does not exist, insert it
            if (!result) {
                const insertQueryC = `INSERT INTO countries (CountryCode, CountryName) VALUES (?, ?)`;
                db.run(insertQueryC, [countryCode, countryName], (insertErr) => {
                    if (insertErr) {
                        console.error("Error inserting new country: ", insertErr);
                    }
                });
            }
        });

        // ###############################################
        // ############## Insert Indicators ##############
        // ###############################################

        const seriesName = row['Series Name'];
        const seriesCode = row['Series Code'];

        // Skip the row if seriesName or seriesCode is empty
        if (!seriesName || !seriesCode) {
          console.log("Skipping empty row");
          return;
        }

        // Check if the indicators already exists in the database
        const checkQueryI = `SELECT * FROM indicators WHERE SeriesName = ? OR SeriesCode = ?`;
        db.get(checkQueryI, [seriesName, seriesCode], (err, result) => {
            
            if (err) {
                console.error("Error checking for existing indicator: ", err);
                return;
            }

            // If the indicators does not exist, insert it
            if (!result) {
                const insertQueryI = `INSERT INTO indicators (SeriesName, SeriesCode) VALUES (?, ?)`;
                db.run(insertQueryI, [seriesName, seriesCode], (insertErr) => {
                    if (insertErr) {
                        console.error("Error inserting new indicator: ", insertErr);
                    }
                });
            }
        });
        // ###############################################
        // ############## Insert Yearl Data ##############
        // ###############################################
    })
      .on('end', () => {
          console.log('CSV file successfully processed');
          res.send("CSV Data Imported Successfully");
      });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });