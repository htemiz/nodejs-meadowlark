var express = require('express');
var app = express();

var handlebars = require('express3-handlebars')
    .create({defaultLayout:'main',
    helpers: {
        section: function (name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
    });

var fortune = require('./library/fortune.js');
var weather = require('./library/produceWeatherData');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);


app.use(function (req, res, next){
    if(!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weather = weather.getWeatherData();
    next();
});

//
app.get(['/', '/home'], function(req, res){
    res.render('home', {
        fortune:fortune.getFortune() });
    // res.type('text/plain');
    // res.send('Meadowlark Travel');
});

app.get('/nursery-rhyme', function (req,res){
    res.render('nursery-rhyme');
});

app.get('/data/nursery-rhyme', function (req,res){
    res.json({
        animal:'squirrel',
        bodyPart:'tail',
        adjective:'bushy',
        noun:'heck',
    });
});

app.get('/about', function(req, res){

    // var randomFortune =
    //     fortunes[Math.floor(Math.random()*fortunes.length)];

    res.render('about', {
        fortune:fortune.getFortune() ,
        pageTestScript: '/qa/tests-about.js'/*randomFortune*/});
    // res.type('text/plain');
    // res.send('About Meadowlark Travel');
});


app.get('/tours/hood-river', function(req,res){
    res.render('tours/hood-river');
});

app.get('/tours/request-group-rate', function(req, res){
    res.render('tours/request-group-rate');
});

app.get('/headers', function (req, res){
    res.set('Content-Type', 'text/plain');
    var s = '';
    for (var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
    res.send(s);
});

app.get('/greeting', function (req, res){
    res.render('about', {
        message:'welcome',
        style:req.query.style,
        userid: req.cookie.userid,
        username:req.session.username,
    });
});

app.get('no-layout', function (req, res){
    res.render('no-layout', {layout:null});
});

app.get('/custom-layout', function (req,res){
    res.render('custom-layout', {layout:'custom'});
});

app.get('/test', function(req,res){
    res.type('text/plain');
    res.send('this is a test');
});



app.post('/process-contact', function (req,res){
    console.log('Received contact from' + req.body.name +
    ' <' + req.body.email + '>');

    try{
        // save to database ...
        return res.xhr ?
            res.render({success:true}):
            res.redirect(303, '/thank-you');
    } catch(ex){
        return res.xhr ?
            res.json({error: 'Database error.'}):
            res.redirect(303, '/database-error');
    }
});

// **************************************************** //
// EXAMPLE 6-12 Get endpoint returning JSON, XML, or text
//
var tours = [
    { id: 0, name: 'Hood River', price: 99.99 },
    { id: 1, name: 'Oregon Coast', price: 149.95 },
];

app.get('/api/tours', function (req,res){
    var toursXml ='<?xml version="1.0"?><tours>' +
        tours.map(function(p){
            return '<tour price="' + p.price + '" id="' + p.id +
                '">' + p.name + '</tour>';
        }).join('') + '</tours>';

    var toursText = tours.map(function (p){
        return p.id + ': ' + p.name + ' (' + p.price + ')';
    }).join('\n');

    res.format({
        'application/json':function(){
            res.json(tours);
        },
        'application/xml': function (){
            res.type('application/xml');
            res.send(toursXml);
        },
        'text/xml': function (){
            res.type('text/xml');
            res.send(toursXml);
        },
        'text/plain': function(){
            res.type('text/plain');
            res.send(toursText)
        }
    });
})
// **************************************************** //



// **************************************************** //
// EXAMPLE 6-13 Put endpoint returning JSON
//
app.put('/api/tour/:id', function (req,res){
    var p = tours.some(function (){ return p.id == req.params.id});
    if(p){
        if(req.query.name) p.name= req.query.name;
        if(req.query.price) p.price = req.query.price;
        res.json({success:true});
    }else{
        res.json({error:'No such tours exists.'});
    }
});
// **************************************************** //


// **************************************************** //
// EXAMPLE 6-14 DEL endpoint for deleting
//
app.delete('/api/tour/:id', function (req,res){
    var i;
    for(var i=tours.length-1;i>=0;i--)
        if(tours[i].id == res.params.id) break;
    if(i>=0){
        tours.splice(i,1);
        res.json({success:true});
    }else{
        res.json({error:'No such tour exists'});
    }
});
// **************************************************** //


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

// this should appear AFTER all of your routes
// note that even if you don't need the "next"
// function, it must be included for Express
// to recognize this as an error handler
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).render('500');
});



app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port')  +
        '; press Ctrl+C to terminate.');
});


// if(app.thing == null) console.log('beat!');



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