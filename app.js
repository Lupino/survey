
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , Survey = require('./survey')
  , config = require('./config')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , errorHandler = require('errorhandler')
  , favicon = require('serve-favicon')
  , RedisStore = require('connect-redis')(session);

var app = express();

var survey = new Survey(config);

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(cookieParser());
app.use(session({
  secret: 'topsecret',
  resave: true,
  saveUninitialized: true,
  store: new RedisStore(config.redis)
}));

app.use(errorHandler());

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
