var should = require('chai').should();

describe('MQTT_server_host functions', function() {
   var Mqtt_server_host = require('../util/mqtt_server_host');
   const url = 'mqtt://localhost:1883';
   const options = {
      clientId: "markmedlin1997",
      clean: true,
   };

   beforeEach(function() {
      myserver = new Mqtt_server_host.MyServer();
   });

   describe('#connect', function() {
      it('should connect until end event', function(done) {
         this.timeout(500);
         
         myserver.on('connect', function() {
            myserver.end();
            myserver.on('end', function() {
               true.should.be.true;
               done();
            });
         });
         myserver.connect(url, options);

      });
   });

   describe('#subscribe', function() {
      it('should subscribe to a topic', function(done) {
         const topic = 'testtopic';

         myserver.on('connect', function() {
            myserver.subscribe(topic);
            myserver.on('subscribe', function() {
               myserver.granted[0].topic.should.be.equal(topic);
               myserver.end();
               myserver.on('end', function() {
                  done();
               });
            })
            
         });
         myserver.connect(url, options);
      });
   });

   describe('#publish', function() {
      it('should publish a message to a topic', function(done) {
         const topic = 'testtopic';
         const msg = 'testmessage';

         myserver.on('message', function() {
            myserver.message.toString().should.be.equal(msg);
            myserver.end();
               myserver.on('end', function() {
                  done();
               });
         });
         myserver.on('connect', function() {
            myserver.subscribe(topic);
            myserver.on('subscribe', function() {
               myserver.publish(topic, msg);
            });
         });
         myserver.connect(url, options);
      });
   });
});
