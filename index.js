var http = require("http");
var url = require("url");
var jsonld_request = require("jsonld-request");
var port = process.argv[3] || 80;

var server = http.createServer(function(req, res) {

    res.setHeader('Content-Type', 'application/json');

    if (req.method == 'GET') {
        var parseUrl = require('querystring').parse(url.parse(req.url).query).q;

        if (!parseUrl) {
            res.statusCode = 500;
            res.end(JSON.stringify({success: false, error: 'URL to parse no provided.'}));
        }
        else {
            try {
                jsonld_request(parseUrl, function (err, r, data) {
                    if (err) {
                        res.statusCode = 500;
                        res.end(JSON.stringify(data));
                    } else if (r.statusCode < 200 || r.statusCode > 300) {
                        res.statusCode = r.statusCode;
                        res.end(JSON.stringify(data));
                    } else {
                        res.end(JSON.stringify(data));
                    }
                });
            } catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify({
                    message: "Failed to parse resource at " + parseUrl
                }));
            }
        }
    } else {
        res.statusCode = 500;
        res.end();
    }
});

server.on('clientError', function(e, socket) {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(port);