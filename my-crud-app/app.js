const express = require('express');
const axios=require('axios')
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const sql = require('./db_config');
//const dotenv=require('dotenv')
const path=require('path')

const app = express();
const PORT = process.env.PORT || 5000;


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const handlebars = exphbs.create({ extname: '.hbs' });
handlebars.handlebars.registerHelper('greaterThan', function(value, threshold, options) {
    if (value > threshold) {
        return options.fn(this); // Render the block if true
    } else {
        return options.inverse(this); // Render the `else` block if false
    }
});

app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'))

// Serve service worker
app.get('/service-worker.js', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'service-worker.js'));
});
app.get('/manifest.json', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'manifest.json'));
});


const routes=require('./routes/student')
app.use('/',routes)
// Start server
app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
});
