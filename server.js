const express = require("express");
const app = express(); // Create an Express application
const bodyParser = require('body-parser'); // Middleware to parse request body
const sqlite3 = require('sqlite3').verbose(); // SQLite module

// Open a new SQLite database in memory
let db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Run queries
        db.serialize(() => {
            // Create a table named 'Login' with columns 'Email' and 'password'
            db.run('CREATE TABLE Login (Email TEXT, password TEXT)');
            db.run('CREATE TABLE Admin (ava TEXT, ava2 TEXT)');
            db.run('CREATE TABLE LAdmin (Email TEXT, password TEXT)');
            db.run('CREATE TABLE Submit (Name TEXT,Faculty TEXT,Department TEXT,Nature TEXT,Phone TEXT,Datef DATETIME,Datefr DATETIME,Datet DATETIME)');
            
            // Insert some data for testing
            let stmtLogin = db.prepare('INSERT INTO Login(Email, password) VALUES (?, ?)');
            stmtLogin.run('suriyaans.22cse@kongu.edu', '22csr213');
            stmtLogin.run('suryaus.22cse@kongu.edu', '22csr214');
            stmtLogin.finalize();

            let stmtLAdmin = db.prepare('INSERT INTO LAdmin(Email, password) VALUES (?, ?)');
            stmtLAdmin.run('vijithsb.22cse@kongu.edu', '22csr239');
            stmtLAdmin.finalize();
    

        });
    }
});

// Start the server and listen on port 3000
app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});

// Middleware to parse JSON bodies and URL encoded bodies
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/Login'))

// Route to handle user login
app.post("/contact", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // Query the database to verify the email and password
  // First, check if the user is in the Login table
db.get('SELECT * FROM Login WHERE Email = ? AND password = ?', [email, password], (err, row) => {
    if (err) {
        console.error('Error querying Login table:', err.message);
        res.status(500).send('Internal server error');
        return;
    }

    if (row) {
        // Redirect to main.html if the user is found in the Login table
        res.redirect("/home");
    } else {
        // If user is not found in the Login table, check LAdmin table
        db.get('SELECT * FROM LAdmin WHERE Email = ? AND password = ?', [email, password], (err, row) => {
            if (err) {
                console.error('Error querying LAdmin table:', err.message);
                res.status(500).send('Internal server error');
                return;
            }

            if (row) {
                // Redirect to home.html if the user is found in the LAdmin table
                res.redirect("/adhome");
            } else {
                // Redirect to login.html if the user is not found in either table
                res.redirect(`/login.html`);
            }
        });
    }
});
});

// Route to handle user login
// Route to handle form submission
app.post("/submitForm", (req, res) => {
    const { nhall, faculty, dep, fun, ph, dtf, dhf, dht } = req.body;

    // Prepare the SQL query to insert form data into the Submit table
    const stmtSubmit = db.prepare('INSERT INTO Submit(Name, Faculty, Department, Nature, Phone, Datef, Datefr, Datet) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    
    // Execute the SQL query to insert form data
    stmtSubmit.run(nhall, faculty, dep, fun, ph, dtf, dhf, dht, (err) => {
        if (err) {
            console.error('Error inserting form data:', err.message);
            res.status(500).send('Internal server error');
            return;
        }

        // Once the data is successfully inserted, fetch the updated data from the database
        db.all('SELECT * FROM Submit', (err, rows) => {
            if (err) {
                console.error('Error querying database:', err.message);
                res.status(500).send('Internal server error');
                return;
            }
            
            // Send the updated form data as the response
            res.json(rows);
        });
    });

    // Finalize the prepared statement
    stmtSubmit.finalize();
});

// Backend (Node.js)
app.post("/updateAvailability1", (req, res) => {
    const availability = req.body.availability;
     
    let stmt = db.prepare('INSERT INTO Admin(ava) VALUES (?)');
    stmt.run(availability);
    console.log("Seminar Hall 1 availability updated");
    console.log(availability);
    // Process the availability value (e.g., save to database)
    // For demonstration purposes, just sending back the received value
    res.json({ availability });
});

// Route to handle fetching availability status for Seminar Hall 1
app.get("/availability1", (req, res) => {
    db.get('SELECT ava FROM Admin', (err, row) => {
        if (err) {
            console.error('Error querying database:', err.message);
            res.status(500).send('Internal server error');
            return;
        }
        
        // Send the availability status of Seminar Hall 1 as the response
        res.send(row ? row.ava : 'Not available');
    });
});


// Route to handle updating availability status for Seminar Hall 2
app.post("/updateAvailability2", (req, res) => {
    const availability = req.body.availability;
     
    let stmt = db.prepare('INSERT INTO Admin(ava2) VALUES (?)');
    stmt.run(availability);
    console.log("Seminar Hall 2 availability updated");
    console.log(availability);
    // Process the availability value (e.g., save to database)
    // For demonstration purposes, just sending back the received value
    res.json({ availability });
});

app.get("/availability2", (req, res) => {
    // Query the database to get the availability status for Seminar Hall 2
    db.get('SELECT ava2 FROM Admin', (err, row) => {
        if (err) {
            console.error('Error querying database:', err.message);
            res.status(500).send('Internal server error');
            return;
        }
        
        // Send the availability status for Seminar Hall 2 as the response
        res.send(row ? row.ava2 : 'Not available');
    });
});

// Route to fetch data from the Submit table
app.get("/admin/data", (req, res) => {
    // Query the database to get all data from the Submit table
    db.all('SELECT * FROM Submit', (err, rows) => {
        if (err) {
            console.error('Error querying database:', err.message);
            res.status(500).send('Internal server error');
            return;
        }
        
        // Send the data as the response
        res.json(rows);
    });
});


// Route to serve the login page
app.get("/login", (req, res) => {
    const errorMessage = req.query.error === 'invalid' ? 'Invalid email or password' : '';
    res.sendFile("/Login/login.html", { root: __dirname });
});

// Route to serve the home page
app.get("/home", (req, res) => {
    res.sendFile("/Main/main.html", { root: __dirname });
});
app.get("/Admin", (req, res) => {
    res.sendFile("/Admin/ad.html", { root: __dirname });
});
app.get("/itcaresoul", (req, res) => {
    res.sendFile("/Main/itcaresoul.html", { root: __dirname });
});
app.get("/seminarhall", (req, res) => {
    res.sendFile("/Main/sh.html", { root: __dirname });
});

app.get("/adhome", (req, res) => {
    res.sendFile("/Main/home.html", { root: __dirname });
});

app.get("/Admin", (req, res) => {
    res.sendFile("/Admin/ad.html", { root: __dirname });
});

app.get("/Amain", (req, res) => {
    res.sendFile("/Main/Amain.html", { root: __dirname });
});

app.get("/Anoti", (req, res) => {
    res.sendFile("/Admin/noti.html", { root: __dirname });
});

