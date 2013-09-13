var express = require("express"),
    app     = express(),
    conn    = require("./routes/mysql"),
    qs      = require('querystring');
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

app.listen(port);

app.get('/', function(req,res) {
    if (req.session.login && req.session.name) {
        res.redirect('/admin');
    } else {
        res.redirect('/login');
    }
});

app.get('/login', function(req,res) {
    res.render('login',{Err:false});
});

app.get('/login/error', function(req,res) {
    res.render('login',{Err:true});
});

app.post('/login', function(req,res) {
    var data  = "",
        params = null;
    req.addListener("data", function(chunk) {
        data += chunk;
        params =  qs.parse(data);
    });

    var sql = "SELECT * FROM `vote_admin` WHERE Account=? AND Password=? LIMIT 1";
    conn.db.query(sql, [params.account, params.passwd], function(err, rows, fiels) {
        if (undefined == rows) {
            res.redirect('/login/error');
        } else {
            req.session.login = rows[0].Account;
            req.session.name = rows[0].Name;
            res.redirect('/admin');
        }
    });
});

app.get('/admin', function(req,res) {
    if ( undefined == req.session.login || undefined == req.session.name) {
        res.redirect('/login');
    } else {
        res.send(req.session.login);
    }
});

app.get('/votes/:vid', function(req,res) {
    res.send(req.params.vid);
});

app.get('/logout', function(req,res) {
    req.session.destroy();
    res.redirect('/login');
});
