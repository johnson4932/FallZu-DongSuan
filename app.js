var express = require('express'),
    app     = express(),
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server),
    api     = require('./routes/api'),
    page    = require('./routes/page'),
    webio   = require('./routes/socket'),
    config  = require('./routes/config'),
    port    = config.port;


app.configure(function() {
    this.set('views', __dirname + '/views');
    this.set('view engine', 'ejs');
    this.use(express.cookieParser());
    this.use(express.session({secret : "secret"}));
    this.use('/public',express.static(__dirname + '/public'));
});

app.configure('development', function() {
    this.use(express.errorHandler({showStack: true, dumpExceptions: true}));
});

server.listen(port);

app.get('/', page.index);
app.get('/login', page.login);
app.get('/login/error', page.loginFail);
app.get('/admin', page.admin);
app.get('/modify/:vid', page.modify);
app.get('/dump/:vid', page.dump);
app.get('/votes/:vid', page.vote);
app.get('/logout', api.logout);

app.post('/login', api.login);
app.all('/api/*', api.APIsession);
app.post('/api/createVote', api.createVote);
app.post('/api/createGroup', api.createGroup);
app.post('/api/createCandidate', api.createCandidate);
app.post('/api/createAdmin', api.createAdmin);
app.post('/api/modifyVote', api.modifyVote);
app.post('/api/modifyGroup', api.modifyGroup);
app.post('/api/modifyCandidate', api.modifyCandidate);
app.post('/api/deleteCandidate', api.deleteCandidate);
app.post('/api/deleteGroup', api.deleteGroup);
app.post('/api/resetVote', api.resetVote);
app.post('/api/deleteVote', api.deleteVote);

io.sockets.on('connection', webio.socket);
