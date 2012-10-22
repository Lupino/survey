
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , Survey = require('./survey')
  , RedisStore = require('connect-redis')(express);

var app = express();

var survey = new Survey(require('./config'));

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, '/public')));
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'topsecret', store: new RedisStore }));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
    res.render('index', {
        title: 'Huaban Survey'
    });
});

app.get('/main', function(req, res){
    res.render('main', {
        title: 'Huaban Survey'
    });
});

require('./api')(app, survey);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
