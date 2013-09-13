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
    var params = getParams(req);

    var sql = "SELECT * FROM `vote_admin` WHERE Account=? AND Password=? LIMIT 1";
    conn.db.query(sql, [params.account, params.passwd], function(err, rows, fiels) {
        if (0 == rows.length) {
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
        var sql = "SELECT `vote_list`.*, `vote_group`.`VGID`,`vote_group`.`Title` FROM `vote_list` LEFT JOIN `vote_group` ON `vote_list`.`VID`=`vote_group`.`VID`";
        conn.db.query(sql, function(err, rows, fiels) {
            var arr = new Object;
            for (var key in rows) {
                console.log(arr[rows[key].VID]);
                if (undefined == arr[rows[key].VID]) {
                    arr[rows[key].VID] = new Object;
                    arr[rows[key].VID].Group = [];
                }
                arr[rows[key].VID].VoteName = rows[key].VoteName;
                arr[rows[key].VID].VoteDate = rows[key].VoteDate;
                arr[rows[key].VID].Group.push(rows[key].Title);
            }
            console.log(arr);

            res.render('admin',{
                Account: req.session.login,
                Name   : req.session.name,
                Result : arr
            });
        });
    }
});

app.get('/votes/:vid', function(req,res) {
    res.send(req.params.vid);
});

app.get('/logout', function(req,res) {
    req.session.destroy();
    res.redirect('/login');
});

//API Session
app.all('/api/*', function(req,res,next) {
    if ( undefined == req.session.login || undefined == req.session.name) {
        next(Error("Please Login"));
    } else {
        next();
    }
});

app.post('/api/createVote', function(req,res) {
    res.setHeader('Content-Type', 'application/json');
    var params = getParams(req);

    if ('' != params.VoteName && '' != params.VoteDate) {
        sql = "INSERT INTO `vote_list` VALUES(NULL,?,?)";
        conn.db.query(sql,[params.VoteName, params.VoteDate], function(err,result) {
            if (err) {
                res.send(JSON.stringify({Success : false, Result: err, Message: 'Create Vote Fail, Database Error'}));
                return;
            }
            res.send(JSON.stringify({Success : true, Result: result, Message: 'Create Vote Success'}));
        });
    } else {
        res.send(JSON.stringify({Success : false, Message: 'Please input params'}));
    }
});

app.post('/api/createGroup', function(req,res) {
    res.setHeader('Content-Type', 'application/json');
    var params = getParams(req);

    if (params.clone) {
        var sql = "SELECT `Title` FROM `vote_group` WHERE `VID`=?";
        conn.db.query(sql, [params.cloneVote], function(err, rows, fiels) {
            if (err) {
                res.send(JSON.stringify({Success : false, Result: err, Message: 'Database Error'}));
                return;
            }
            var insertSQL = "INSERT INTO `vote_group` VALUES";
            var insertParams = [];
            for (var key in rows) {
                insertSQL += "(NULL,?,?),";
                insertParams.push(params.VoteName);
                insertParams.push(rows[key].Title);
            }

            conn.db.query(insertSQL.substr(0,insertSQL.length - 1), insertParams, function(err, result) {
                if (err) {
                    res.send(JSON.stringify({Success : false, Result: err, Message: 'Clone Group Fail, Database Error'}));
                    return;
                }
                res.send(JSON.stringify({Success : true, Result: result, Message: 'Clone Group Success'}));
            });
        });
    } else {
        if (0 == params.GroupName.length) {
            res.send(JSON.stringify({Success : false, Message: 'Please input params'}));
            return;
        }

        var sql = "INSERT INTO `vote_group` VALUES";
        var insertParams = [];
        for(var key in params.GroupName) {
            if ('' == params.GroupName[key]) {
                continue;
            }
            sql += "(NULL,?,?),";
            insertParams.push(params.VoteName);
            insertParams.push(params.GroupName[key]);
        }

        conn.db.query(sql.substr(0,sql.length - 1), insertParams, function(err, result) {
            if (err) {
                res.send(JSON.stringify({Success : false, Result: err, Message: 'Create Group Fail, Database Error'}));
                return;
            }
            res.send(JSON.stringify({Success : true, Result: result, Message: 'Create Group Success'}));
        });
    }
});

function getParams(req) {
    var data  = "",
        params = null;
    req.addListener("data", function(chunk) {
        data += chunk;
        params =  qs.parse(data);
    });
    return params;
}
