const mqtt = require('mqtt');
const EventEmitter = require('events');

class MyServer extends EventEmitter {
   
   // Constructor
   constructor(url, options) {
      super();
      this._client = null;
      this._granted = null;
      this._message = null;
   }

   // Getters
   get granted() { return this._granted; }
   get message() { return this._message; }

   connect(url, options) {
      var self = this;
      this._client = mqtt.connect(url, options);
      
      this._client.on('message', function (topic, message) {
         self._message = message;
         self.emit('message');
      });

      this.emit('connect');
   };

   subscribe(topic) {
      var self = this;
      this._client.subscribe(topic, function(err, granted) {
         if (err) { console.log(err); }
         self._granted = granted;
         self.emit('subscribe');
      });
   };

   publish(topic, message) {
      var self = this;
      this._client.publish(topic, message, function(err) {
         if (err) { console.log(err); }
         self.emit('publish');
      });
   };

   end() {
      var self = this;
      this._client.end(function() {
         self.emit('end');
      });
   };
};

module.exports = {MyServer};
