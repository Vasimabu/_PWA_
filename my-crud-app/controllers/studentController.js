const mssql = require('mssql'); // Ensure you have required the mssql module
const config = require('../db_config'); // Ensure you have your configuration file

//read
/* exports.view = (req, res) => {
    // Connect to Database
    mssql.connect(config, err => {
        if (err) {
            console.error("Database connection error: ", err);
            res.status(500).send("Database connection error");
            return;
        }

        // Create a new request instance
        const request = new mssql.Request();

        // Query the database
        request.query("SELECT * FROM users", (err, result) => {
            mssql.close(); // Ensure to close the connection after query

            if (err) {
                console.error("Error executing query: ", err);
                res.status(500).send("Error executing query");
                return;
            }

            // Log the rows to the console
            //console.log("Query results: ", result.recordset);

            // Render the view with the result
            exports.handleCityFilter = async (req, res) => {
                console.log(req.body)
                const selectedCity = req.query.City; // Get selected city from query string
            
                try {
                    const pool = await mssql.connect(config);
                    const request = new mssql.Request(pool);
            
                    // Modify query based on selected city
                    let query = 'SELECT * FROM users';
                    if (selectedCity) {
                        query += ' WHERE City = @City';
                        request.input('City', mssql.NVarChar, selectedCity);
                    }
            
                    const result = await request.query(query);
            
                    // Render the view with filtered users
                    res.render({ citi: [], users: result.recordset }); // Adjust citi as needed
                } catch (err) {
                    console.error('Database error: ', err);
                    res.status(500).send('An error occurred while processing your request.');
                } finally {
                    await mssql.close();
                }
            };
            
            res.render('home', { users: result.recordset });
        });
    });
}; */
exports.view = async (req, res) => {
    const selectedCity = req.query.City; // Get selected city from query string

    try {
        const pool = await mssql.connect(config);
        const request = new mssql.Request(pool);

        // Modify query based on selected city
        let query = 'SELECT * FROM users';
        if (selectedCity) {
            query += ' WHERE City = @City';
            request.input('City', mssql.NVarChar, selectedCity);
        }

        // Fetch users based on the query
        const result = await request.query(query);

        // Fetch distinct cities for the dropdown
        const citiesResult = await request.query('SELECT DISTINCT City FROM users ORDER BY City');

        // Add a flag to indicate if Age > 50
        const users = result.recordset.map(user => ({
            ...user,
            isOlderThan50: user.Age > 30
        }));

        // Render the view with filtered users and cities
        res.render('home', { 
            users,
            citi: citiesResult.recordset 
        });
    } catch (err) {
        console.error('Database error: ', err);
        res.status(500).send('An error occurred while processing your request.');
    } finally {
        await mssql.close();
    }
};



//create
exports.adduser = (req, res) => {
    res.render('adduser');
};
exports.save = async (req, res) => {
    try {
        // Extract data from request body
        const { Name, Age, City } = req.body;

        // Log the extracted data to verify
        console.log('Received data:', { Name, Age, City });

        // Validate incoming data
        if (!Name || !Age || !City) {
            console.error('Invalid input data');
            res.status(400).send("Invalid input data. Please provide Name, Age, and City.");
            return;
        }

        // Create a new connection
        const pool = await mssql.connect(config);

        // Create a new request instance and set parameters
        const request = new mssql.Request(pool);
        request.input('Name', mssql.NVarChar, Name);
        request.input('Age', mssql.Int, parseInt(Age)); // Ensure Age is an integer
        request.input('City', mssql.NVarChar, City);

        // Define and execute the query
        const query = "INSERT INTO users (Name, Age, City) VALUES (@Name, @Age, @City)";
        await request.query(query);

        // Success: Redirect to a success page or another route
        res.render('adduser',{msg:"user details add sucess"}); // Ensure you have a route for '/adduser'
    } catch (err) {
        // Log detailed error information
        console.error("Database error: ", err);

        res.status(500).send("An error occurred while processing your request.");
    } finally {
        // Ensure the connection is closed
        await mssql.close();
    }
};

// Render the edit user form with current user details
exports.editUserForm = (req, res) => {
    const userId = req.params.id;

    // Connect to the database
    mssql.connect(config, err => {
        if (err) {
            console.error("Database connection error: ", err);
            res.status(500).send("Database connection error");
            return;
        }

        const request = new mssql.Request();

        // Query to get the user details by ID
        request.input('ID', mssql.Int, userId);
        request.query("SELECT * FROM users WHERE ID = @ID", (err, result) => {
            mssql.close(); // Ensure to close the connection

            if (err) {
                console.error("Error executing query: ", err);
                res.status(500).send("Error executing query");
                return;
            }

            if (result.recordset.length === 0) {
                res.status(404).send("User not found");
                return;
            }

            // Render the edit form with the user details
            res.render('edituser', { user: result.recordset[0] });
        });
    });
};

// Handle the update request
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { Name, Age, City } = req.body;

        // Log the extracted data to verify
        console.log('Received data:', { Name, Age, City });

        // Validate incoming data
        if (!Name || !Age || !City) {
            console.error('Invalid input data');
            res.status(400).send("Invalid input data. Please provide Name, Age, and City.");
            return;
        }

        // Create a new connection
        const pool = await mssql.connect(config);

        // Create a new request instance and set parameters
        const request = new mssql.Request(pool);
        request.input('ID', mssql.Int, userId);
        request.input('Name', mssql.NVarChar, Name);
        request.input('Age', mssql.Int, parseInt(Age)); // Ensure Age is an integer
        request.input('City', mssql.NVarChar, City);

        // Define and execute the query
        const query = `
            UPDATE users
            SET Name = @Name, Age = @Age, City = @City
            WHERE ID = @ID
        `;
        await request.query(query);

        // Success: Redirect to a success page or another route
       // res.redirect('/'); // Redirect to the home page or user list page
       //res.redirect(`/edituser/${userId}?msg=User details updated successfully.`)
       res.render('edituser',{msg:'User details updated successfully'})
    } catch (err) {
        // Log detailed error information
        console.error("Database error: ", err);

        res.status(500).send("An error occurred while processing your request.");
    } finally {
        // Ensure the connection is closed
        await mssql.close();
    }
};

exports.delete = (req, res) => {
    const userId = req.params.id;

    // Connect to the database
    mssql.connect(config, err => {
        if (err) {
            console.error("Database connection error: ", err);
            res.status(500).send("Database connection error");
            return;
        }

        const request = new mssql.Request();

        // Query to get the user details by ID
        request.input('ID', mssql.Int, userId);
        request.query("delete from users WHERE ID = @ID", (err, result) => {
            mssql.close(); // Ensure to close the connection

            if (err) {
                console.error("Error executing query: ", err);
                res.status(500).send("Error executing query");
                return;
            }

            /* if (result.recordset.length === 0) {
                res.status(404).send("User not found");
                return;
            } */

            // Render the edit form with the user details
           // res.redirect('/', { user: result.recordset[0] });
           res.redirect('/');
        });
    });
};


