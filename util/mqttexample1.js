var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://85.119.83.194')  // mqtt://test.mosquitto.org
// var client  = mqtt.connect('mqtt://localhost:1883')

client.on('connect', function () {
   client.subscribe('presence', function (err, granted) {
      if (err) { console.log(err); }
      else {
         console.log('Granted: '+ JSON.stringify(granted));
         client.publish('presence', 'Hello mqtt');
      }
   })
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(topic + ': ' + message.toString())
  client.end()
})

client.on('connect', function () {
   console.log('connected: ' + client.connected);
});

client.on('end', function () {
   console.log('ended');
   console.log('connected: ' + client.connected);

});