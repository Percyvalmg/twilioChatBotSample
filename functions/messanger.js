const accountSid = '<your-sid>';
const authToken = '<your-auth-token>';
const client = require('twilio')(accountSid, authToken);

class Messenger {
    sendMessage(to,  message){
        client.messages
            .create({
                body: message,
                from: `whatsapp:<your-number>`,
                to: to,
                validityPeriod: 500
            })
            .then(message => console.log(message.sid)).done();
    }
}

module.exports = Messenger;
