const mqtt = require('mqtt');

var client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', function () {
   client.subscribe('reks', function (err, granted) {
      if (err) { console.log(err); }
   });
});

function publishPics(message) {
   client.publish('pics', message);
};

client.on('message', function(topic, message) {
   console.log(topic + ' ' + message);
   client.end();
});

module.exports = {client, publishPics}; 