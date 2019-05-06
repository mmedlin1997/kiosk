const mqtt = require('mqtt');
const EventEmitter = require('events');

class MyKiosk extends EventEmitter {
   
   // Constructor
   constructor(url, options) {
      super();
      this._url = url;
      this._options = {
         clientId: options.clientId,
         clean: options.clean,
      }
      this._msg = '';
      this._granted = {};
      this._publish = '';   
   }

   // Getters and setters
   get message() { return this._msg; }
   get granted() { return JSON.stringify(this._granted); }
   get publish() { return 'Publish result: ' + ((this.publish) ? this._publish : 'no error'); }

   // Sendmessage function
   sendMessage(topic, message) {
      var self = this;
      var client = mqtt.connect(self._url);

      client.on('connect', function () {
         client.subscribe(topic, function(err, granted) {
            if (err) { console.log(err); }
            else {
               self._granted = granted; 
               client.publish(topic, message, function(err) {
                  if (err) { console.log(err); }
                  else {
                     self._publish = err;
                     self._msg = message;
                  }
               });
            };
         });
   
         client.on('message', function (topic, message) {
            switch (topic) {
               case 'rek':
                  // TODO handle aws rekognition response
                  client.end();
                  break;
               case 'msgs': 
                  self._msg = message.toString();
                  self.emit('onMessage');
                  client.end();
                  break;
               default :
                  self._msg = message.toString();
                  self.emit('onMessage');
                  client.end();
            }
         });
      });
   };
};

module.exports = {MyKiosk};
