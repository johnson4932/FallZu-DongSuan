var express = require('express'),
    app     = express(),
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server),
    api     = require('./routes/api'),
    page    = require('./routes/page'),
    port    = 1234;

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
app.get('/votes/:vid', page.vote);
app.get('/logout', api.logout);

app.post('/login', api.login);
app.all('/api/*', api.APIsession);
app.post('/api/createVote', api.createVote);
app.post('/api/createGroup', api.createGroup);
app.post('/api/createAdmin', api.createAdmin);

io.sockets.on('connection', function(socket) {
    socket.on('Add', function(obj) {
        socket.broadcast.emit('add',obj);
    });

    socket.on('Title', function(obj) {
        //console.log(obj.Val);
        //console.log(obj.ID);
        socket.broadcast.emit('title',obj);
    });
});
