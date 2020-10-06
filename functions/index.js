const functions = require('firebase-functions');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const clientRequest = require('./clientRequest');
const Messenger = require('./messanger');
const messenger = new Messenger();

class Client {
    constructor(fName, cNum) {
        this.firstName = fName;
        this.cellNumber = cNum;
    }
}

class Order {
    constructor(fName, cNum, oType, qNum, pList) {
        this.client = new Client(fName, cNum);
        this.orderType = oType;
        this.queueNumber = qNum;
        this.productList = pList;
    }
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/ping', (req, res) => {
    res.send('I am up!');
})

app.post('/orderType', (req, res) => {
    const responseBody = req.body;
    console.log(responseBody);

    if (responseBody != null) {
        let json;

        try {
            json = JSON.parse(responseBody.Memory.toString());
        } catch (err) {
            console.error(err)
        }

        const twilio = json.twilio;
        const message = twilio["messaging.whatsapp"];
        const cellNumber = message.From;
        const collectedData = twilio.collected_data;
        const orderQuestions = collectedData.order_questions;
        const answers = orderQuestions.answers;
        const firstName = answers.first_name.answer;
        const orderType = answers.order_type.answer;
        const productList = answers.menu_order.answer;

        const order = new Order(firstName, cellNumber, orderType, 1, productList);

        const to = responseBody.UserIdentifier;
        if (orderType === 'delivery' || orderType === 'Delivery') {
            messenger.sendMessage(to, `Thank you for your response ${order.client.firstName},\n\n*Order Details*\nOrdered Items: ${order.productList}\nOrder Type: ${order.orderType}\n\n*NB:* Please send me your delivery location and type the word *"confirm"* to finalise your transaction or *"amend"* to make some changes.`);
        } else {
            messenger.sendMessage(to, `Thank you for your response ${order.client.firstName},\n\n*Order Details*\nOrdered Items: ${order.productList}\nOrder Type: ${order.orderType}\n\n*NB:* Please type the word *"confirm"* to finalise your transaction or *"amend"* to make some changes.`);
        }

        res.status(200).send('Success');
    } else {
        res.status(500).send('Error');
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}...`);
})

exports.app = functions.https.onRequest(app);
