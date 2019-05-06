const mqtt = require('mqtt');

const url = 'mqtt://localhost:1883'
const servertopic = ['pics','pics2'];
const clienttopic = 'reks';
var client, server;

// Setup
server = mqtt.connect(url).subscribe(servertopic, function() {
   server.on('message', function(topic, message) {
      console.log('Server: ' + topic)
      switch(topic) {
         case 'pics':
            console.log('Server: ' + topic + ' ' + message);
            var newmsg = message + '_rek';
            server.publish('reks', newmsg);
            break;
         case 'pics2':
            console.log('Server: ' + topic + ' ' + JSON.parse(message).filename)
            var newmsg = JSON.parse(message);
            server.publish('reks', 'hello');
            break;
         default:
            server.publish('reks', 'default');
      }
   });

   client = mqtt.connect(url).subscribe(clienttopic, function() {
      client.on('message', function(topic, message) {
         console.log('Client: ' + topic + ' ' + message);
      });
   });
});

// Teardown
setTimeout(function(){
   client.publish('pics', 'pic1');
}, 1000)

// Teardown
setTimeout(function(){
   client.end();
   server.end();
}, 2000)