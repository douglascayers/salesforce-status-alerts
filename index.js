var http = require('http');
var request = require('request');
// var schedule = require('node-schedule');
// var express = require('express');
// var app = express();

// app.set('port', (process.env.PORT || 5000));

// app.get( '/', function( request, response ) {

//     return http.get({
//         host: 'http://api.status.salesforce.com',
//         path: '/v1/instances/na5/status',
//         json: true
//     }, function( response ) {
//         console.log( response );
//         return response;
//     });

// });

// app.listen( app.get('port'), function() {
//     console.log( 'Node app is running on port', app.get('port') );
// });

var request = require('request');
var instanceName = 'na5';
var options = {
    url : 'http://api.status.salesforce.com/v1/instances/' + instanceName + '/status',
    json : true
};
console.log('Executing request, options=' + JSON.stringify( options ) );
request( options , function( error, response, body ) {
    console.log( body );
});