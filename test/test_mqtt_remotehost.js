var mqtt = require('mqtt');
var fs = require('fs');
var should = require('chai').should();

describe('MQTT publish subscribe', function() {
   describe('using remotehost', function() {
      
      beforeEach(function(done) {
         // Setup server and client
         const url = 'mqtt://85.119.83.194';    // Right IP for mqtt://test.mosquitto.org
         const servertopic = ['pics','pics2'];
         const clienttopic = 'reks';

         server = mqtt.connect(url).subscribe(servertopic, function() {
            server.on('message', function(topic, message) {
               switch(topic) {
                  case 'pics':
                     console.log('Server: ' + topic + ' ' + message);
                     var newmsg = message + '_rek';
                     server.publish('reks', newmsg);
                     break;
                  case 'pics2':
                     var data = JSON.parse(message);
                     data.payload = "person_id";
                     data.time1 = getNanoSecTime();
                     server.publish('reks', JSON.stringify(data));
                     break;
               }
            });

            client = mqtt.connect(url).subscribe(clienttopic, function() {
               // client.on('message', function(topic, message) {
               //    console.log('Client: ' + topic + ' ' + message);
               // });
               done();
            });
         });
      });
      
      afterEach(function(done) {
         // End server and client connections
         client.end(function(){
            server.end(function() {
               done();
            });
         });
      });

      it('should publish a pic and get a response', function(done) {
         var filename = 'image400x600.jpg';
         let msg = {
            filename: filename,
            payload: fs.readFileSync(__dirname + '/' + filename),
            time0: getNanoSecTime(),
            time1: null,
            time2: null,
         };
         client.publish('pics2', JSON.stringify(msg), function() {
            client.on('message', function(topic, message) {
               var data = JSON.parse(message);
               data.time2 = getNanoSecTime();

               // Results
               // console.log(message.toString());
               data.filename.should.be.equal(filename);
               console.log('Out: ' + ((data.time1-data.time0)/1000000) + 'ms');
               console.log('Back: ' + ((data.time2-data.time1)/1000000) + 'ms');
               console.log('RTT: ' + ((data.time2-data.time0)/1000000) + 'ms');
               done();
            });
         });
      });
   });
});

// Helper functions
function getNanoSecTime() {
   var hrTime = process.hrtime();
   return hrTime[0] * 1000000000 + hrTime[1];
}
