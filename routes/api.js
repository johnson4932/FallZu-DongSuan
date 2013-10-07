var conn    = require('../routes/mysql'),
    crypto  = require('crypto');
    qs      = require('querystring');

exports.login = function(req,res) {
    var sql = "SELECT * FROM `vote_admin` WHERE Account=? AND Password=? LIMIT 1";
    var md5 = crypto.createHash('md5').update(req.body.Passwd).digest("hex");
    conn.db.query(sql, [req.body.Account, md5], function(err, rows, fiels) {
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
    if ('' != req.body.VoteName && '' != req.body.VoteDate) {
        sql = "INSERT INTO `vote_list` VALUES(NULL,?,?)";
        conn.db.query(sql,[req.body.VoteName, req.body.VoteDate], function(err,result) {
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
    if (req.body.clone) {
        var sql = "SELECT `Title` FROM `vote_group` WHERE `VID`=?";
        conn.db.query(sql, [req.body.cloneVote], function(err, rows, fiels) {
            if (err) {
                res.send(JSON.stringify({Success : false, Result: err, Message: 'Database Error'}));
                return;
            }
            var insertSQL = "INSERT INTO `vote_group` VALUES";
            var insertParams = [];
            for (var key in rows) {
                insertSQL += "(NULL,?,?),";
                insertParams.push(req.body.VID);
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
        if (0 == req.body.GroupName.length) {
            res.send(JSON.stringify({Success : false, Message: 'Please input params'}));
            return;
        }

        var sql = "INSERT INTO `vote_group` VALUES";
        var insertParams = [];
        if ('string' != typeof req.body.GroupName) {
            for(var key in req.body.GroupName) {
                if ('' == req.body.GroupName[key]) {
                    continue;
                }
                sql += "(NULL,?,?),";
                insertParams.push(req.body.VID);
                insertParams.push(req.body.GroupName[key]);
            }
        } else {
            sql += "(NULL,?,?),";
            insertParams.push(req.body.VID);
            insertParams.push(req.body.GroupName);
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
    if ('' != req.body.VID || '' != req.body.CandidateNubmer || '' != req.body.CandidateName) {
        var sql = "INSERT INTO `vote_candidate` VALUES(NULL,?,0,?,?,0)";
        conn.db.query(sql, [req.body.VID,req.body.CandidateNubmer,req.body.CandidateName], function(err, result) {
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
    if ('' != req.body.Account && '' != req.body.Passwd) {
        if (req.body.Passwd != req.body.PasswdConfirm) {
            res.send(JSON.stringify({Success : false, Message: 'Password is different'}));
            return;
        }

        var sql = "INSERT INTO `vote_admin` VALUES(?,?,?)";
        var md5 = crypto.createHash('md5').update(req.body.Passwd).digest("hex");
        conn.db.query(sql, [req.body.Account,md5,req.body.AdminName], function(err, result) {
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
    var sql = "UPDATE `vote_list` SET ";
    var prepare = [];

    if (undefined != req.body.VoteDate) {
        sql += "`VoteDate`=? ";
        prepare.push(req.body.VoteDate);
    }

    if (undefined != req.body.VoteName) {
        sql += "`VoteName`=? ";
        prepare.push(req.body.VoteName);
    }

    sql += "WHERE `VID`=?";
    prepare.push(req.body.VID);

    conn.db.query(sql, prepare, function(err, result) {
        if (err) {
            res.send(JSON.stringify({Success : false, Result: err, Message: 'Update Vote Fail, Database Error'}));
            return;
        }
        res.send(JSON.stringify({Success : true, Result: result, Message: 'Update Vote Success'}));
    });
};

exports.modifyGroup = function(req,res) {
    var sql = "UPDATE `vote_group` SET `Title`=? WHERE `VGID`=?";
    conn.db.query(sql, [req.body.Title,req.body.VGID], function(err, result) {
        if (err) {
            res.send(JSON.stringify({Success : false, Result: err, Message: 'Update Group Fail, Database Error'}));
            return;
        }
        res.send(JSON.stringify({Success : true, Result: result, Message: 'Update Group Success'}));
    });
};

exports.modifyCandidate = function(req,res) {
    var sql = "UPDATE `vote_candidate` SET ";
    var prepare = [];

    if (undefined != req.body.Number) {
        sql += "`Number`=? ";
        prepare.push(req.body.Number);
    }

    if (undefined != req.body.Name) {
        sql += "`Name`=? ";
        prepare.push(req.body.Name);
    }

    sql += "WHERE `UID`=?";
    prepare.push(req.body.UID);

    conn.db.query(sql, prepare, function(err, result) {
        if (err) {
            res.send(JSON.stringify({Success : false, Result: err, Message: 'Update Candidate Fail, Database Error'}));
            return;
        }
        res.send(JSON.stringify({Success : true, Result: result, Message: 'Update Candidate Success'}));
    });
};

exports.modifyAdmin = function(req,res) {
    if (undefined != req.body.Account && undefined != req.body.Name) {
    } else {
    }
    conn.db.query("UPDATE `vote_admin` SET `Name`=? WHERE `Account`=?", [req.body.Name,req.body.Account], function(err, result){
        if (err) {
            res.send(JSON.stringify({Success : false, Result: err, Message: 'Update Admin Fail, Database Error'}));
            return;
        }
        res.send(JSON.stringify({Success : true, Result: result, Message: 'Update Admin Success'}));
    });
};

exports.deleteCandidate = function(req,res) {
    conn.db.query("DELETE FROM `vote_candidate` WHERE `UID`=?", [req.body.UID], function(err, result) {
        if (err) {
            res.send(JSON.stringify({Success : false, Result: err, Message: 'Delete Candidate Fail, Database Error'}));
            return;
        }
        res.send(JSON.stringify({Success : true, Result: result, Message: 'Delete Candidate Success'}));
    });
};

exports.deleteGroup = function(req,res) {
    conn.db.query("DELETE FROM `vote_group` WHERE `VGID`=?", [req.body.VGID], function(err, result) {
        if (err) {
            res.send(JSON.stringify({Success : false, Result: err, Message: 'Delete Group Fail, Database Error'}));
            return;
        }
        res.send(JSON.stringify({Success : true, Result: result, Message: 'Delete Group Success'}));
        conn.db.query("UPDATE `vote_candidate` SET `VGID`='0' WHERE `VGID`=?", [req.body.VGID]);
    });
};

exports.deleteVote = function(req,res) {
    if (undefined == req.body.VID) {
        res.send(JSON.stringify({Success : false, Message: 'Please Input VID'}));
        return;
    }

    conn.db.query("DELETE FROM `vote_list` WHERE `VID`=?", [req.body.VID], function(err, result) {
        if (err) {
            res.send(JSON.stringify({Success : false, Result: err, Message: 'Delete Vote Fail, Database Error'}));
            return;
        }
        conn.db.query("DELETE FROM `vote_group` WHERE `VID`=?", [req.body.VID]);
        conn.db.query("DELETE FROM `vote_candidate` WHERE `VID`=?", [req.body.VID]);
        res.send(JSON.stringify({Success : true, Message: 'Delete Vote Success'}));
    });
};

exports.deleteAdmin = function(req,res) {
    if (undefined == req.body.Account) {
        res.send(JSON.stringify({Success : false, Message: 'Please Input Account'}));
        return;
    }

    conn.db.query('DELETE FROM `vote_admin` WHERE `Account`=?', [req.body.Account], function(err, result) {
        if (err) {
            res.send(JSON.stringify({Success : false, Result: err, Message: 'Delete Admin Fail, Database Error'}));
            return;
        }
        res.send(JSON.stringify({Success : true, Message: 'Delete Admin Success'}));
    });
};

exports.resetVote = function(req,res) {
    if (undefined == req.body.VID) {
        res.send(JSON.stringify({Success : false, Message: 'Please Input VID'}));
        return;
    }

    conn.db.query("UPDATE `vote_candidate` SET `VoteCount`='0', `VGID`='0' WHERE `VID`=?", [req.body.VID], function(err, result) {
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
