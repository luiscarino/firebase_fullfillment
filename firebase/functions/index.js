// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "ws://androidthingskit.firebaseio.com"
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {    
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
   }
  
   function lightIntentHandler(agent) {
    const newLightValue = agent.parameters.lightValue;
    console.log(`new value "${newLightValue}"`)
    return admin.database().ref("lights").once("value").then((snapshot) => {
        var currentValue = snapshot.child("ON").val();
        var obtValue;
        if(!newLightValue.localeCompare("on")) {
            obtValue = true;
        } else {
            obtValue = false;
        }
        var obj = {ON : obtValue}
        console.log(`new object to save ON:"${obtValue}"`)
        admin.database().ref("lights").set(obj)
        agent.add(`Sure your lights were "${currentValue}" now I'm turning them "${newLightValue}"`)
        
    });
    
   }
  
  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('light', lightIntentHandler);
  agent.handleRequest(intentMap);
});
