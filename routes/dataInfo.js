
var dataInfo = function () { };

var mongoSite = {
    username: 'root',
    password: '4dark',
    host: 'localhost',
    db: 'website'
}
dataInfo.mongoSite = mongoSite;
var mysql = {
    username: 'root',
    password: '4dark',
    host: 'localhost',
    db: 'sames',
    port: 3306
}
dataInfo.mysql = mysql;
module.exports = dataInfo;
