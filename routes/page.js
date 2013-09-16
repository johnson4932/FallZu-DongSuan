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
    if ('kspaic' == req.params.vid) {
        res.render('votes_admin');
    } else {
        res.render('votes');
    }
};

exports.admin = function(req,res) {
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
};

exports.loginFail = function(req,res) {
    res.render('login',{Err:true});
};
