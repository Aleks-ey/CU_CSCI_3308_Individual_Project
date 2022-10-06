/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
var express = require('express'); //Ensure our express framework has been added
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const axios = require('axios');
const qs = require('query-string');

//Create Database Connection
var pgp = require('pg-promise')();

/**********************
  Database Connection information
  host: This defines the ip address of the server hosting our database.
		We'll be using `db` as this is the name of the postgres container in our
		docker-compose.yml file. Docker will translate this into the actual ip of the
		container for us (i.e. can't be access via the Internet).
  port: This defines what port we can expect to communicate to our database.  We'll use 5432 to talk with PostgreSQL
  database: This is the name of our specific database.  From our previous lab,
		we created the football_db database, which holds our football data tables
  user: This should be left as postgres, the default user account created when PostgreSQL was installed
  password: This the password for accessing the database. We set this in the
		docker-compose.yml for now, usually that'd be in a seperate file so you're not pushing your credentials to GitHub :).
**********************/
const dev_dbConfig = {
	host: 'db',
	port: 5432,
	database: process.env.POSTGRES_DB,
	user:  process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD
};

/** If we're running in production mode (on heroku), the we use DATABASE_URL
 * to connect to Heroku Postgres.
 */
const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = isProduction ? process.env.DATABASE_URL : dev_dbConfig;

// Heroku Postgres patch for v10
// fixes: https://github.com/vitaly-t/pg-promise/issues/711
if (isProduction) {
  pgp.pg.defaults.ssl = {rejectUnauthorized: false};
}

const db = pgp(dbConfig);

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory

// main page
app.get('/', function(req, res) {
	res.render('pages/main',{
		local_css:"",
		my_title:"Main Page",
    items: '',
    error: false,
    message: ''
	});
});

app.post('/get_feed', function(req, res) {
  var Artist = req.body.Artist; //TODO: Remove null and fetch the param (e.g, req.body.param_name); Check the NYTimes_home.ejs file or console.log("request parameters: ", req) to determine the parameter names
  
  if(Artist) {
    
    axios({
      url: `https://www.theaudiodb.com/api/v1/json/2/search.php?s=${Artist}`,
        method: 'GET',
        dataType:'json',
      })
        .then(items => {
          
          res.render('pages/main', {
            my_title: "Main page",
            items: items.data.artists,
            error: false,
            message: ''
          })
        })
        .catch(error => {
          console.log("hello");
          res.render('pages/main',{
            my_title: "Main page",
            items: '',
            error: true,
            message: error
          })
        });
  }
  else {
    res.render('pages/main',{
      my_title: "Main page",
      items: '',
      error: true,
      message: "Uh Oh! There was an issue, sorry!"
    })
  }
});

app.post('/saveReview',function(req,res) {
  
  var artistS = req.body.artistN;
  var reviewS = req.body.reviewTxt;
  
  
  var insert_statement = "INSERT INTO reviews(artist_name,review,created) VALUES('"+artistS+"','"+reviewS+"',NOW());";
  

  db.task('post-data', task => {
    return task.batch([
      task.any(insert_statement),
    ]);
  })
  .then(data => {
    var artistQ = 'SELECT artist_name,review,created FROM reviews;';
    
    db.task('next', task => {
      return task.batch([
        task.any(artistQ),
      ])
    })
    .then(data => {
      res.render('pages/review',{
        local_css:"",
        my_title:"Review Page",
        allArtists: data[0]
      })
    })
    // res.redirect('pages/review');
  })
  .catch(err => {
    console.log('error', err);
    res.render('pages/review', {
        my_title: 'Review Page',
        allArtists: '',
    })
  });

});

// review page
app.get('/review', function(req, res) {
  var artistQ = 'SELECT artist_name,review,created FROM reviews;';

  db.task('get-everything', task => {
    return task.batch([
      task.any(artistQ),
    ]);
  })
  .then(data => {
    res.render('pages/review',{
      local_css:"",
      my_title:"Review Page",
      allArtists: data[0],
    })
  })
  .catch(err => {
    console.log('error', err);
    res.render('pages/review', {
        my_title: 'Review Page',
        allArtists: '',
    })
  });
});

//app.listen(3000);
const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
  });
