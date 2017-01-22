var Curl = require( 'node-libcurl' ).Curl;
 
var curl = new Curl();
 
curl.setOpt( 'URL', 'https://graph.facebook.com/me?access_token=EAAZAFmu3ZB54UBALMk2vd4aKZB5LaVf5vUlSv9TNG45OiZATVZCXgpA6VeTyocl2RrwEAwpVkBqx0MdnlNsNJtlyznZBlZCGFgWZANhR591gMZB7spTRe4EZBSP6R6aor6UZBES4sZBsrWOAPoCzQZCBb7YT1pq8TgmaMFaMZD' );
curl.setOpt( 'FOLLOWLOCATION', true );
 
curl.on( 'end', function( statusCode, body, headers ) {
 
    //console.log(Object.keys(body));
    var data = JSON.parse(body);
    
    if(data.hasOwnProperty('error')){
        console.info("invalid token");
    } else {
        console.info("login successful");
    }
    
    console.info( data );
 
    this.close();
});
 
curl.on( 'error', curl.close.bind( curl ) );
curl.perform();