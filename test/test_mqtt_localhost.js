var mqtt = require('mqtt');
var fs = require('fs');
var should = require('chai').should();

describe('MQTT publish subscribe', function() {
   describe('using localhost', function() {
      
      beforeEach(function(done) {
         // Setup server and client
         const url = 'mqtt://localhost:1883'
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
                     console.log('Server: ' + topic + ' ' + JSON.parse(message).filename)
                     var newmsg = JSON.parse(message);
                     server.publish('reks', newmsg.filename+'_rek');
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

      it('should publish a message and get a response', function(done) {  
         client.publish('pics', 'pic1', function() {
            client.on('message', function(topic, message) {
               message.toString().should.be.equal('pic1_rek');
               done()
            });
         });
      });

      it('should publish a message and get a response (RTT array)', function(done) {
         var times = [];
         var count = 0;
         var limit = 10;
         for (var i=0; i<limit; i++) {
            if(i>=limit){
               done();
            }
            var startTime = getNanoSecTime();
            client.publish('pics', 'pic1', function() {
               client.on('message', function(topic, message) {
                  message.toString().should.be.equal('pic1_rek');
                  var stopTime = getNanoSecTime();
                  times.push((stopTime - startTime)/1000000);
                  count++;
                  if(count==limit) {
                     console.log(times);
                     done()
                  }
               });
            });
         };
      });

      it('should publish a pic and get a response', function(done) {
         var img = fs.readFileSync(__dirname + '/image400x600.jpg');
         let msg = {
            filename: 'image400x600.jpg',
            data: img,
         };
         client.publish('pics2', JSON.stringify(msg), function() {
            client.on('message', function(topic, message) {
               console.log(message.toString());
               message.toString().should.be.equal('image400x600.jpg_rek');
               done();
            });
         });
      });

      it('should publish a pic and get a response (RTT array)', function(done) {
         var times = [];
         var count = 0;
         var limit = 10;
         var img = fs.readFileSync(__dirname + '/image400x600.jpg');
         let msg = {
            filename: 'image400x600.jpg',
            data: img,
         };
         for (var i=0; i<limit; i++) {
            if(i>=limit){
               done();
            }
            var startTime = getNanoSecTime();
            client.publish('pics2', JSON.stringify(msg), function() {
               client.on('message', function(topic, message) {
                  message.toString().should.be.equal('image400x600.jpg_rek');
                  var stopTime = getNanoSecTime();
                  times.push((stopTime - startTime)/1000000);
                  count++;
                  if(count==limit) {
                     console.log(times);
                     done()
                  }
               });
            });
         };
      });
   });
});

// Helper functions
function getNanoSecTime() {
   var hrTime = process.hrtime();
   return hrTime[0] * 1000000000 + hrTime[1];
}
