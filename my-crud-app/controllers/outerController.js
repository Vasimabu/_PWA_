const mssql = require('mssql'); // Ensure you have required the mssql module
const config = require('../db_config'); // Ensure you have your configuration file


exports.getCities = async (req, res) => {
    try {
        const pool = await mssql.connect(config);
        const request = new mssql.Request(pool);
        const result = await request.query('SELECT DISTINCT City FROM users ORDER BY City');
        res.render('home',{citi: result.recordset, users:[]});
    } catch (err) {
        console.error('Database error: ', err);
        res.status(500).send('An error occurred while fetching cities.');
    } finally {
        await mssql.close();
    }
};

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
        res.render('home',{ citi: [], users: result.recordset, }); // Adjust citi as needed
    } catch (err) {
        console.error('Database error: ', err);
        res.status(500).send('An error occurred while processing your request.');
    } finally {
        await mssql.close();
    }
};

// exports.fixtures= async (req, res) => {
//     try {
//         const response = await axios.get('https://staging.cricket-21.com/cricketapi/api/matchcenter/fixtures?compid=1948&type=json');
//         res.json(response.data);
//     } catch (error) {
//         console.error('Error fetching data from the external API:', error);
//         res.status(500).send('An error occurred while fetching data.');
//     }
// };