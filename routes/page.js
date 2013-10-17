var conn    = require('../routes/mysql'),
    config  = require('../routes/config'),
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
            Vote        :result[2],
            Host        :config.hostname,
            Port        :config.port
        };
        res.render('votes',obj);
    });
};

exports.admin = function(req,res) {
    if ( undefined == req.session.login || undefined == req.session.name) {
        res.redirect('/login');
    } else {
        async.parallel([
            function(callback) { conn.db.query("SELECT * FROM `vote_list` ORDER BY `VID` DESC",function(err, result){callback(err, result);}); },
            function(callback) { conn.db.query("SELECT * FROM `vote_admin` ORDER BY `Account` ASC",function(err, result){callback(err, result);}); },
        ],function(err, result) {
            res.render('admin',{
                Account: req.session.login,
                Name   : req.session.name,
                Result : result[0],
                Admin  : result[1]
            });
        });
    }
};

exports.modify = function(req,res) {
    if ( undefined == req.session.login || undefined == req.session.name) {
        res.redirect('/login');
    } else {
        var VID = req.params.vid;
        async.parallel([
            function(callback) { conn.db.query("SELECT * FROM `vote_candidate` WHERE `VID`=?", [VID], function(err, result){ callback(err, result);}); },
            function(callback) { conn.db.query("SELECT * FROM `vote_group` WHERE `VID`=?", [VID], function(err, result){ callback(err, result);}); },
            function(callback) { conn.db.query("SELECT * FROM `vote_list` WHERE `VID`=? LIMIT 1", [VID], function(err, result){ callback(err, result);}); },
            function(callback) { conn.db.query("SELECT * FROM `vote_list` WHERE `VID`<>?", [VID], function(err, result){ callback(err, result);}); }
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

exports.dump = function(req,res) {
    if ( undefined == req.session.login || undefined == req.session.name) {
        res.redirect('/login');
    } else {
        var VID = req.params.vid;
        async.parallel([
            function(callback) { conn.db.query("SELECT `VoteName`,`VoteDate` FROM `vote_list` WHERE `VID`=? LIMIT 1", [VID], function(err, result){ callback(err, result);}); },
            function(callback) { conn.db.query("SELECT `vote_candidate`.`Number`,`vote_candidate`.`Name`,`vote_candidate`.`VoteCount`,`vote_group`.`Title` FROM `vote_candidate` LEFT JOIN `vote_group` ON `vote_candidate`.`VGID`=`vote_group`.`VGID` WHERE `vote_candidate`.`VID`=? ORDER BY `vote_candidate`.`VoteCount` DESC", [VID], function(err, result){ callback(err, result);}); }
        ],function(err, result) {
            var filename = result[0][0]['VoteName'] + result[0][0]['VoteDate'];
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', 'filename=' + filename + '.csv');

            var str = '';
            str += '編號,姓名,票數,當選\n';
            for (var key in result[1]) {
                var val = result[1][key];
                str += val['Number'] + ',' + val['Name'] + ',' + val['VoteCount'] + ',' + ((null == val['Title']) ? ('') : (val['Title'])) + '\n';
            }
            res.send(str);

        });
    }
}

exports.loginFail = function(req,res) {
    res.render('login',{Err:true});
};
