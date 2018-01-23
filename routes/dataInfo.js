
var dataInfo = function () { };

var mongoSite = {
    username: 'username',
    password: 'password',
    host: 'localhost',
    db: 'dbname'
}
dataInfo.mongoSite = mongoSite;
var mysql = {
    username: 'username',
    password: 'password',
    host: 'localhost',
    db: 'dbname',
    port: 3306
}
dataInfo.mysql = mysql;
module.exports = dataInfo;
