var express = require("express"),
    app     = express(),
    conn    = require("./routes/mysql"),
    port    = 1234;

app.configure(function(){
    this.set('views', __dirname + '/views');
    this.set('view engine', 'ejs');
    this.use(express.cookieParser());
    this.use(express.session({secret : "secret"}));
    this.use(express.static(__dirname + '/public'));
    this.use('/public',express.static(__dirname + '/public'));
});

app.configure('development', function(){
    this.use(express.errorHandler({showStack: true, dumpExceptions: true}));
});

app.listen(port);

app.get('/',function(req,res){
    res.render('index');
});
