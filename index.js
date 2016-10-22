var request = require('request');

var instanceName = 'na5';

var options = {
    url : 'http://api.status.salesforce.com/v1/instances/' + instanceName + '/status',
    json : true
};

console.log('Executing request, options=' + JSON.stringify( options ) );

request( options , function( error, response, body ) {

    console.log( body );

    sendEmail({
        "from": "donotreply@example.com",
        "to": "douglascayers@gmail.com",
        "subject": "Test",
        "textBody": "Test Message"
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