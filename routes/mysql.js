var db_options = {
    host: "127.0.0.1",
    user: "",
    password: "",
    database: "test"
};
var mysql = new require("mysql");
var db = null;

db = mysql.createConnection(db_options);
db.connect(function(err) {
    if(err) {
        console.error(err);
        return;
    }
    console.log("Mysql Connect");
});

exports.db = db;

