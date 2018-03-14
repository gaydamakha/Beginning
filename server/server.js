var express = require('express');
var https = require('https');
var http = require('http');
var app = express();
var fs = require('fs');


var options = {
    key: fs.readFileSync('/etc/ssl/ssl_sertificate1.key'),
    cert: fs.readFileSync('/etc/ssl/ssl_sertificate1.crt')
};

http.Server(app).listen(80);
var server = https.Server(options, app).listen(443);


function requireHTTPS(req, res, next) {
    if (!req.secure) {
        //FYI this should work for local development as well
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}

app.use(requireHTTPS);


app.get('/',function(req, res) {
	res.sendFile('/home/hoster/app/client/index.html');
});
app.get('/about',function(req, res) {
	res.sendFile('/home/hoster/app/client/about.html');
});
app.use('/',express.static('/home/hoster/app/client'));

module.exports={
	server:server
}