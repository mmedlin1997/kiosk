const mqtt = require('mqtt');

var mqttclient = function(url = '', options = {clientId:"", clean:true}){
   this.url = url;
   this.options = {
      clientId: options.clientId,
      clean: options.clean,
   }
}

mqttclient.prototype.getUrl = function() {
   return this.url;
}

mqttclient.prototype.getOptions = function() {
   return this.options;
}

mqttclient.prototype.connect = function() {
   var client = mqtt.connect(this.url, this.options);

   client.on('connect', function () {
      client.subscribe('presence', function (err) {
         if (!err) {
            client.publish('presence', 'Hello mqtt')
         }
      })
   })
     
   client.on('message', function (topic, message) {
      // message is Buffer
      console.log(message.toString())
      client.end()
   })
   
   client.on("error", function(error) {
      console.log("Can't connect: " + error);
      process.exit(1);
   });
}


module.exports = mqttclient;

// TODO
// Does it handle a connection failure correctly
// Does it handle a connection success correctly
// Does it parse the message payload (json?) correctly
// Does it handle an malformed payload correctly.