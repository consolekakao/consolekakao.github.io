var http = require('http');
var fs = require('fs');
var url = require('url');
var app = http.createServer(function(request,response){
var u = request.url;
var data = url.parse(u,true).query;
console.log(data);
response.end(data);

});
app.listen(3000);