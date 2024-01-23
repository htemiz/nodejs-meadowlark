var express = require('express');
var app = express();

var handlebars = require('express3-handlebars')
    .create({defaultLayout:'main'});

var fortune = require('./lib/fortune.js');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));



app.get('/', function (req, res) {
    res.render('home');
});

app.get('/about', function (req, res) {
    // var randomFortune =
    //     fortunes[Math.floor(Math.random() * fortunes.length)];
    res.render('about', {fortune:fortune.getFortune()});
});


app.get('')




app.use(function (req, res, next) {
    res.status(404);
    res.render('404');
});

app.use(function(err,req, res, next) {
   console.error(err.stack);f
   res.status(500);
    res.render('500');
});




