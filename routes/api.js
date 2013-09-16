var conn    = require('../routes/mysql'),
    qs      = require('querystring');

function getParams(req) {
    var data  = "",
        params = null;
    req.addListener("data", function(chunk) {
        data += chunk;
        params =  qs.parse(data);
    });
    return params;
}

exports.login = function(req,res) {
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
};

exports.APIsession = function(req,res,next) {
    if ( undefined == req.session.login || undefined == req.session.name) {
        next(Error("Please Login"));
    } else {
        next();
    }
};

exports.createVote = function(req,res) {
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
};

exports.createGroup = function(req,res) {
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
};

exports.logout = function(req,res) {
    req.session.destroy();
    res.redirect('/login');
};