var conn    = require('../routes/mysql');
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
    var obj = {Login:req.session.login};
    res.render('votes',obj);
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
        res.render('modify',{VID:req.params.vid});
    }
}

exports.loginFail = function(req,res) {
    res.render('login',{Err:true});
};
