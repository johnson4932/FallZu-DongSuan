var express = require("express"),
    app     = express(),
    port    = 1234;

app.configure(function(){
    this.set('views', __dirname + '/views');
    this.set('view engine', 'ejs');
    this.use(express.cookieParser());
    this.use(express.session({secret : "secret"}));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.listen(1234);

app.get('/',function(req,res){
    res.send("Hello");
});
