// sesEmailService.js
const AWS = require('aws-sdk');

AWS.config.update({ region: process.env.AWS_REGION });

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

function sendEmail(to, subject, bodyText, bodyHtml) {
    const params = {
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Subject: {
                Charset: 'UTF-8',
                Data: subject,
            },
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: bodyText,
                },
                ...(bodyHtml && {
                    Html: {
                        Charset: 'UTF-8',
                        Data: bodyHtml,
                    }
                })
            },
        },
        Source: 'bina@binaapp.com',
    };

    return ses.sendEmail(params).promise();
}

module.exports = { sendEmail };
