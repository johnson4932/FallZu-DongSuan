var conn    = require('../routes/mysql');
exports.socket = function(socket) {
    socket.on('Add', function(obj) {
        conn.db.query("UPDATE `vote_candidate` SET `VoteCount`=VoteCount + 1 WHERE UID=?", [obj.UID], function(err, result) {
            conn.db.query("SELECT `VoteCount` FROM `vote_candidate` WHERE UID=? LIMIT 1", [obj.UID], function(err, result) {
                obj.VoteCount = result[0]['VoteCount'];
                socket.broadcast.emit('add',obj);
            });
        });
    });

    socket.on('Title', function(obj) {
        conn.db.query("UPDATE `vote_candidate` SET `VGID`=? WHERE UID=?", [obj.Val,obj.UID], function(err, result) {
            if (err) {
                return;
            }
            socket.broadcast.emit('title',obj);
        });
    });
};

