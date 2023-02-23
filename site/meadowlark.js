var express = require('express');

var app = express();

var handlebars = require('express3-handlebars')
    .create({defaultLayout:'main'});

var fortune = require('./library/fortune.js')

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.get(['/', '/home'], function(req, res){
    res.render('home');
    // res.type('text/plain');
    // res.send('Meadowlark Travel');
});

app.get('/about', function(req, res){

    // var randomFortune =
    //     fortunes[Math.floor(Math.random()*fortunes.length)];

    res.render('about', {fortune:fortune.getFortune() /*randomFortune*/});
    // res.type('text/plain');
    // res.send('About Meadowlark Travel');
});

app.use(function(req, res, next){
    res.locals.showTests = app.get('env') !== 'production' &&
        req.query.test === '1';
    next();
});

app.use(express.static(__dirname + '/public'));

// custom 404 page
app.use(function(req,res, next){
    // res.type('text/plain');
    res.status(404);
    // res.send('404 - Not Found');
    res.render(404);
});

// custom 500 page
app.use(function(err,req,res, next){
    console.error(err.stack);
    // res.type('text/plain');
    res.status(500);
    // res.send('500 - Server Error');
    res.render('500');
});

//

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port')
    + '; press Ctrl+C to terminate.');
});






/*var http = require('http')


http.createServer(function(req,res){
     // normalize url by removing querystring, optional
    // trailing slash, and making it lowercase
    console.log('URL: ' + req.url);
    var path = req.url.replace(/\/?(?:\?.*)?$/, '').toLowerCase();

    console.log('URL parse edilen: ' + path);

    switch(path){
        case '': res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end('Homepage');
                break;
        case '/about':
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end('About');
                break;
        default:
                res.writeHead(400, {'Content-Type': 'text/plain'});
                res.end('Not Found');
                break;
    }
    // res.writeHead(200,{'Content-Type':'text/plain'});
    // res.end('Hello World!');
}).listen(3000);

console.log('Server started on localhost:3000; press Ctrl+C to terminate...');
*/