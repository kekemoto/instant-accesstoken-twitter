var http = require('http')
var OAuth = require('oauth').OAuth
var nodeUrl = require('url')
var clientID = ''
var clientSecret = ''
var callbackURL = 'https://instant-twitter-accesstoken.herokuapp.com/callback'


http.createServer(function (request, response) {
    var urlObj = nodeUrl.parse(request.url, true);
    var handlers = {
        '/': function (request, response) {
            // Setting Consumer key & Consumer secret
            try {
                var cache=[]
                var string = JSON.stringify(request, function (key, value) {
                    if (typeof value === 'object' && value !== null) {
                        if (cache.indexOf(value) !== -1) {
                            // Circular reference found, discard key
                            return;
                        }
                        // Store value in our collection
                        cache.push(value);
                    }
                    return value;
                })
                cache=null
                response.writeHead(200, {"Content-Type": "text/plain"})
                response.end(string)
            } catch (error) {
                console.dir(error)
                response.writeHead(503, {"Content-Type": "text/plain"})
                response.end('Error: ' + error.message)
            }
            console.log(request)
        },
        '/url': function (request, response) {
            // Make url for request Twitter window
            var oauth = new OAuth(
                'https://api.twitter.com/oauth/request_token',
                'https://api.twitter.com/oauth/access_token',
                clientID,
                clientSecret,
                '1.0',
                callbackURL,
                'HMAC-SHA1'
            )
            oauth.getOAuthRequestToken(function (error, oAuthToken, oAuthTokenSecret, results) {
                if (error) {
                    console.error(error)
                    response.writeHead(503, {"Content-Type": "text/plain"})
                    response.end(JSON.stringify(error))
                }
                var authURL = 'https://twitter.com/oauth/authenticate?oauth_token=' + oAuthToken;
                var body = '<a href="' + authURL + '"> Get Code </a>';
                response.writeHead(200, {
                    'Content-Length': body.length,
                    'Content-Type': 'text/html'
                });
                response.end(body);
            })
        },
        '/callback': function (request, response) {
            // Obtaining access_token
            var getOAuthRequestTokenCallback = function (error, oAuthAccessToken, oAuthAccessTokenSecret, results) {
                if (error) {
                    console.log(error);
                    response.end(JSON.stringify({
                        message: 'Error occured while getting access token',
                        error: error
                    }));
                    return;
                }

                response.end(oAuthAccessToken + '  ' + oAuthAccessTokenSecret)
            };
            oa.getOAuthAccessToken(urlObj.query.oauth_token, oAuthTokenSecret, urlObj.query.oauth_verifier, getOAuthRequestTokenCallback);
        }
    };

    if (handlers.hasOwnProperty(urlObj.pathname)) {
        handlers[urlObj.pathname](request, response);
    } else {
        response.writeHead(404, {'Contest-Type': 'text/HTML'})
        response.end('<h1>Not Found</h1>')
    }
}).listen(process.env.PORT || 8080);
