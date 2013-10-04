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
        if ('string' != typeof params.GroupName) {
            for(var key in params.GroupName) {
                if ('' == params.GroupName[key]) {
                    continue;
                }
                sql += "(NULL,?,?),";
                insertParams.push(params.VID);
                insertParams.push(params.GroupName[key]);
            }
        } else {
            sql += "(NULL,?,?),";
            insertParams.push(params.VID);
            insertParams.push(params.GroupName);
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
        var sql = "INSERT INTO `vote_candidate` VALUES(NULL,?,0,?,?,0)";
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

exports.modifyVote = function(req,res) {
    var params = getParams(req);

    var sql = "UPDATE `vote_list` SET ";
    var prepare = [];

    if (undefined != params.VoteDate) {
        sql += "`VoteDate`=? ";
        prepare.push(params.VoteDate);
    }

    if (undefined != params.VoteName) {
        sql += "`VoteName`=? ";
        prepare.push(params.VoteName);
    }

    sql += "WHERE `VID`=?";
    prepare.push(params.VID);

    conn.db.query(sql, prepare, function(err, result) {
        if (err) {
            res.send(JSON.stringify({Success : false, Result: err, Message: 'Update Vote Fail, Database Error'}));
            return;
        }
        res.send(JSON.stringify({Success : true, Result: result, Message: 'Update Vote Success'}));
    });
};

exports.modifyGroup = function(req,res) {
    var params = getParams(req);

    var sql = "UPDATE `vote_group` SET `Title`=? WHERE `VGID`=?";
    conn.db.query(sql, [params.Title,params.VGID], function(err, result) {
        if (err) {
            res.send(JSON.stringify({Success : false, Result: err, Message: 'Update Group Fail, Database Error'}));
            return;
        }
        res.send(JSON.stringify({Success : true, Result: result, Message: 'Update Group Success'}));
    });
};

exports.modifyCandidate = function(req,res) {
    var params = getParams(req);

    var sql = "UPDATE `vote_candidate` SET ";
    var prepare = [];

    if (undefined != params.Number) {
        sql += "`Number`=? ";
        prepare.push(params.Number);
    }

    if (undefined != params.Name) {
        sql += "`Name`=? ";
        prepare.push(params.Name);
    }

    sql += "WHERE `UID`=?";
    prepare.push(params.UID);

    conn.db.query(sql, prepare, function(err, result) {
        if (err) {
            res.send(JSON.stringify({Success : false, Result: err, Message: 'Update Candidate Fail, Database Error'}));
            return;
        }
        res.send(JSON.stringify({Success : true, Result: result, Message: 'Update Candidate Success'}));
    });
};

exports.deleteCandidate = function(req,res) {
    var params = getParams(req);

    conn.db.query("DELETE FROM `vote_candidate` WHERE `UID`=?", [params.UID], function(err, result) {
        if (err) {
            res.send(JSON.stringify({Success : false, Result: err, Message: 'Delete Candidate Fail, Database Error'}));
            return;
        }
        res.send(JSON.stringify({Success : true, Result: result, Message: 'Delete Candidate Success'}));
    });
};

exports.deleteGroup = function(req,res) {
    var params = getParams(req);

    conn.db.query("DELETE FROM `vote_group` WHERE `VGID`=?", [params.VGID], function(err, result) {
        if (err) {
            res.send(JSON.stringify({Success : false, Result: err, Message: 'Delete Group Fail, Database Error'}));
            return;
        }
        res.send(JSON.stringify({Success : true, Result: result, Message: 'Delete Group Success'}));
        conn.db.query("UPDATE `vote_candidate` SET `VGID`='0' WHERE `VGID`=?", [params.VGID]);
    });
};

exports.deleteVote = function(req,res) {
    var params = getParams(req);

    if (undefined == params.VID) {
        res.send(JSON.stringify({Success : false, Message: 'Please Input VID'}));
        return;
    }

    conn.db.query("DELETE FROM `vote_list` WHERE `VID`=?", [params.VID], function(err, result) {
        if (err) {
            res.send(JSON.stringify({Success : false, Result: err, Message: 'Delete Vote Fail, Database Error'}));
            return;
        }
        conn.db.query("DELETE FROM `vote_group` WHERE `VID`=?", [params.VID]);
        conn.db.query("DELETE FROM `vote_candidate` WHERE `VID`=?", [params.VID]);
        res.send(JSON.stringify({Success : true, Message: 'Delete Vote Success'}));
    });
};

exports.resetVote = function(req,res) {
    var params = getParams(req);

    if (undefined == params.VID) {
        res.send(JSON.stringify({Success : false, Message: 'Please Input VID'}));
        return;
    }

    conn.db.query("UPDATE `vote_candidate` SET `VoteCount`='0', `VGID`='0' WHERE `VID`=?", [params.VID], function(err, result) {
        if (err) {
            res.send(JSON.stringify({Success : false, Result: err, Message: 'Reset Vote Fail, Database Error'}));
            return;
        }
        res.send(JSON.stringify({Success : true, Message: 'Reset Vote Success'}));
    });
};

exports.logout = function(req,res) {
    req.session.destroy();
    res.redirect('/login');
};
