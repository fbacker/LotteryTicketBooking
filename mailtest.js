var smtpConfig = {
    host: 'smtp.folkspel.se',
    port: 25,
    secure: false
};

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport(smtpConfig);

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'no.reply@folkspel.se', // sender address
    to: 'fredrick.backer@folkspel.se', // list of receivers
    subject: 'Du har lotter', // Subject line
    text: 'Test', // plaintext body
    html: '<b>Hello world</b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});