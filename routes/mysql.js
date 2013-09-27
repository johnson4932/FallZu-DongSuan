var mysql       = new require("mysql"),
    config      = require('./config'),
    db_options  = {
        host: config.db_host,
        user: config.db_account,
        password: config.db_passwd,
        database: config.db_name
    },
    db = null;

db = mysql.createConnection(db_options);
db.connect(function(err) {
    if(err) {
        console.error(err);
        return;
    }
    console.log("Mysql Connect");
});

exports.db = db;

