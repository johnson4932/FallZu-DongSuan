var conn    = require('../routes/mysql'),
    async   = require('async');
exports.index = function(req,res) {
    if (req.session.login && req.session.name) {
        res.redirect('/admin');
    } else {
        res.redirect('/login');
    }
};

exports.login = function(req,res) {
    res.render('login',{Err:false});
};

exports.vote = function(req,res) {
    var VID = req.params.vid;
    async.parallel([
        function(callback){ conn.db.query("SELECT `vote_candidate`.*,`vote_group`.`Title` FROM `vote_candidate` LEFT JOIN `vote_group` ON `vote_candidate`.`VGID` = `vote_group`.`VGID` WHERE `vote_candidate`.`VID`=?", [VID], function(err, result){ callback(err, result);}); },
        function(callback){ conn.db.query("SELECT * FROM `vote_group` WHERE `VID`=?", [VID], function(err, result){ callback(err, result);}); },
        function(callback){ conn.db.query("SELECT * FROM `vote_list` WHERE `VID`=? LIMIT 1", [VID], function(err, result){ callback(err, result);}); },
    ],function(err, result) {
        var obj = {
            Login       :req.session.login,
            VID         :VID,
            Candidate   :result[0],
            Group       :result[1],
            Vote        :result[2]
        };
        res.render('votes',obj);
    });
};

exports.admin = function(req,res) {
    if ( undefined == req.session.login || undefined == req.session.name) {
        res.redirect('/login');
    } else {
        var sql = "SELECT * FROM `vote_list` ORDER BY `VID` DESC";
        conn.db.query(sql, function(err, rows, fiels) {
            res.render('admin',{
                Account: req.session.login,
                Name   : req.session.name,
                Result : rows
            });
        });
    }
};

exports.modify = function (req,res) {
    if ( undefined == req.session.login || undefined == req.session.name) {
        res.redirect('/login');
    } else {
        var VID = req.params.vid;
        async.parallel([
            function(callback){ conn.db.query("SELECT * FROM `vote_candidate` WHERE `VID`=?", [VID], function(err, result){ callback(err, result);}); },
            function(callback){ conn.db.query("SELECT * FROM `vote_group` WHERE `VID`=?", [VID], function(err, result){ callback(err, result);}); },
            function(callback){ conn.db.query("SELECT * FROM `vote_list` WHERE `VID`=? LIMIT 1", [VID], function(err, result){ callback(err, result);}); },
            function(callback){ conn.db.query("SELECT * FROM `vote_list` WHERE `VID`<>?", [VID], function(err, result){ callback(err, result);}); }
        ], function(err, result) {
            res.render('modify',{
                VID         :VID,
                Candidate   :result[0],
                Group       :result[1],
                Vote        :result[2],
                OtherVote   :result[3]
            });
        });
    }
}

exports.loginFail = function(req,res) {
    res.render('login',{Err:true});
};
