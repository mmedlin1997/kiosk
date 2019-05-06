const mqtt = require('mqtt');
var server = null;

function connect(url) {
   return new Promise(function(resolve, reject){
      server = mqtt.connect(url);
      
      server.on('message', function(topic, message) {
         var processPic = 'rek_'+ message + '_' + Date().toString;
         server.publish('reks', processPic);
      });

      resolve('connected!');
   });
};

function subscribe(topic) {
   return new Promise(function(resolve, reject) {
      server.subscribe(topic, function (err, granted) {
         if(!err) {
            resolve(granted);
         }
         else {
            reject(err);
         }
      });
   });
};

function end() {
   return new Promise(function(resolve, reject) {
      server.end();
      server.on('end', function() {
         resolve();
      });
   });
};

module.exports = {server, connect, subscribe, end}; 