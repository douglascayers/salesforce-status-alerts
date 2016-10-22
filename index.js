var express = require('express');
var app = express();

app.set( 'port', (process.env.PORT || 5000) );

app.listen( app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

app.get( '/', function( req, res ) {

    /*
     * Resources
     *      - http://www.spacjer.com/blog/2014/02/10/defining-node-dot-js-task-for-heroku-scheduler/
     *      - https://devcenter.heroku.com/articles/scheduler
     *      - https://devcenter.heroku.com/articles/sendgrid#node-js
     *      - https://www.npmjs.com/package/moment-timezone
     *      - https://www.npmjs.com/package/node-redis
     *      - https://www.npmjs.com/package/request
     *      - https://www.npmjs.com/package/sendgrid
     */

    // redis database
    var redis = require('redis');
    var redis_client = redis.createClient( process.env.REDIS_URL );

    // for making http requests to trust website
    var request = require('request');

    // for handling and comparing dates
    var moment = require('moment-timezone');

    // the salesforce instance whose status to check
    var instanceName = process.env.INSTANCE_KEY;

    var currentStatusCheckDt = moment();
    var lastStatusCheckDt = null;

    var options = {
        url : 'http://api.status.salesforce.com/v1/instances/' + instanceName + '/status',
        json : true
    };

    console.log( 'Executing request, options=' + JSON.stringify( options ) );

    request( options, function( error, response, body ) {

        if ( !error ) {

            // when did we last check?
            redis_client.get( 'lastStatusCheckDateTime', function( error, result ) {

                console.log( 'redis get lastStatusCheckDateTime' );
                console.log( 'error=' + error );
                console.log( 'result=' + result );

                if ( result ) {
                    lastStatusCheckDt = moment( result ).startOf( 'hour' );
                } else {
                    lastStatusCheckDt = moment().subtract( 1, 'days' ).startOf( 'hour' );
                }

                var message = {
                    'Instance' : body.key,
                    'Location' : body.location,
                    'Environment' : body.environment,
                    'Release' : body.releaseVersion,
                    'Status' : body.status
                };

                message.incidents = [];

                for ( var i in body.Incidents ) {

                    var incident = body.Incidents[i];

                    var incidentDt = moment( incident.updatedAt );

                    if ( incidentDt.isAfter( lastStatusCheckDt ) ) {

                        message.incidents.push({
                            'ID' : incident.id,
                            'Root Cause' : incident.message.rootCause,
                            'Action Plan' : incident.message.actionPlan,
                            'Path to Resolution' : incident.message.pathToResolution,
                            'Additional Info' : incident.additionalInformation,
                            'Last Updated' : incident.updatedAt
                        });

                    }

                }

                if ( message.Status != 'OK' || message.incidents.length > 0 ) {

                    sendEmail({
                        "from": "trust@salesforce.com",
                        "to": process.env.EMAIL_ALERTS_TO,
                        "subject": "Instance Status Alert",
                        "textBody": JSON.stringify( message, null, 4 )
                    });

                }

                // remember the last time we checked instance status
                redis_client.set( 'lastStatusCheckDateTime', currentStatusCheckDt.format(), function( error, result ) {

                    console.log( 'redis set lastStatusCheckDateTime' );
                    console.log( 'error=' + error );
                    console.log( 'result=' + result );

                });

            });

        } else {

            console.error( error );
            console.log( body );

        }

        res.send( body );

    });

});

/**
 * options = {
 *   'from'    : 'you@email.com',
 *   'to'      : 'someone@email.com',
 *   'subject' : 'hello world',
 *   'textBody': 'your text message'
 * }
 */
function sendEmail( options ) {

    // https://devcenter.heroku.com/articles/sendgrid#node-js

    console.log( 'Sending email: ' + JSON.stringify( options, null, 4 ) );

    var helper = require('sendgrid').mail;
    var from_email = new helper.Email( options.from );
    var to_email = new helper.Email( options.to );
    var subject = options.subject;
    var content = new helper.Content('text/plain', options.textBody );
    var mail = new helper.Mail(from_email, subject, to_email, content);

    var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
    var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
    });

    sg.API(request, function(error, response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
    });

}