var request = require('request');

var instanceName = 'na5';

var options = {
    url : 'http://api.status.salesforce.com/v1/instances/' + instanceName + '/status',
    json : true
};

console.log( 'Executing request, options=' + JSON.stringify( options ) );

request( options , function( error, response, body ) {

    if ( !error ) {

        console.log( body );

        var message =
            'Instance: ' + body.key + '\n' +
            'Location: ' + body.location + '\n' +
            'Environment: ' + body.environment + '\n' +
            'Release: ' + body.releaseVersion + '\n' +
            'Status: ' + body.status + '\n\n' +
            '[Incidents]'
        ;

        for ( var i in body.Incidents ) {

            var incident = body.Incidents[i];

            message +=
                '    ID: ' + incident.id + '\n' +
                '    Root Cause: ' + incident.message.rootCause + '\n' +
                '    Action Plan: ' + incident.message.actionPlan + '\n' +
                '    Path to Resolution: ' + incident.message.pathToResolution + '\n' +
                '    Additional Info: ' + incident.additionalInformation + '\n' +
                '    Last Updated: ' + incident.updatedAt + '\n\n';

        }

        sendEmail({
            "from": "trust@salesforce.com",
            "to": "douglascayers@gmail.com",
            "subject": "Instance Status Alert",
            "textBody": message
        });


    } else {

        console.log( error );
        console.log( body );

    }

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