console.log('index.js');

sendEmail({
    "from": "trust@salesforce.com",
    "to": process.env.EMAIL_ALERTS_TO,
    "subject": "index js test",
    "textBody": 'test'
});

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