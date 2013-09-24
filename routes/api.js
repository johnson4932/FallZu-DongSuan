var conn    = require('../routes/mysql'),
    crypto  = require('crypto');
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
    var md5 = crypto.createHash('md5').update(params.Passwd).digest("hex");
    conn.db.query(sql, [params.Account, md5], function(err, rows, fiels) {
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
    res.setHeader('Content-Type', 'application/json');
    if ( undefined == req.session.login || undefined == req.session.name) {
        next(Error("Please Login"));
    } else {
        next();
    }
};

exports.createVote = function(req,res) {
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
                insertParams.push(params.VID);
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
            insertParams.push(params.VID);
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

exports.createCandidate = function(req,res) {
    var params = getParams(req);

    if ('' != params.VID || '' != params.CandidateNubmer || '' != params.CandidateName) {
        var sql = "INSERT INTO `vote_candidate` VALUES(NULL,?,0,?,?)";
        conn.db.query(sql, [params.VID,params.CandidateNubmer,params.CandidateName], function(err, result) {
            if (err) {
                res.send(JSON.stringify({Success : false, Result: err, Message: 'Create Candidate Fail, Database Error'}));
                return;
            }
            res.send(JSON.stringify({Success : true, Result: result, Message: 'Create Candidate Success'}));
        });
    } else {
        res.send(JSON.stringify({Success : false, Message: 'Please input params'}));
        return;
    }
};

exports.createAdmin = function(req,res) {
    var params = getParams(req);

    if ('' != params.Account && '' != params.Passwd) {
        if (params.Passwd != params.PasswdConfirm) {
            res.send(JSON.stringify({Success : false, Message: 'Password is different'}));
            return;
        }

        var sql = "INSERT INTO `vote_admin` VALUES(?,?,?)";
        var md5 = crypto.createHash('md5').update(params.Passwd).digest("hex");
        conn.db.query(sql, [params.Account,md5,params.AdminName], function(err, result) {
            if (err) {
                res.send(JSON.stringify({Success : false, Result: err, Message: 'Create Admin Fail, Database Error'}));
                return;
            }
            res.send(JSON.stringify({Success : true, Result: result, Message: 'Create Admin Success'}));
        });
    } else {
        res.send(JSON.stringify({Success : false, Message: 'Please input params'}));
        return;
    }
};

exports.logout = function(req,res) {
    req.session.destroy();
    res.redirect('/login');
};
