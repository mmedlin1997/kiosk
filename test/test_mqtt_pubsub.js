var should = require('chai').should();

describe('MQTT_publish_subscribe', function() {
   var Mqtt_server_host = require('../util/mqtt_server_host');
   const url = 'mqtt://localhost:1883';
   const options = {
      clientId: "markmedlin1997",
      clean: true,
   };

   beforeEach(function() {
      myserver = new Mqtt_server_host.MyServer();
      myclient = new Mqtt_server_host.MyServer();
   });

   describe('#message from client', function() {
      it('should go to server', function(done) {
         myserver.on('message', function() {
            myserver.connect(url, options);
            myserver.on('connect', function() {
               myserver.subscribe('pics');
            });
            
            myclient.connect(url, options);
            myclient.on('connect', function() {
               myclient.subscribe('reks');
            });

            myserver.message.should.be.equal('pic1');
            done();
         });
         myclient.publish('pics', 'pic1');
      })
   });

   // describe('#message from client', function() {
   //    it('should get message form server', function() {
   //       myclient.publish('pics', 'pic2');
   //       myserver.on('message', function() {
   //          myserver.publish('reks', 'pic2id');
   //          myserver.on('publish', function() {
   //             myclient.on('message', function() {
   //                myclient.message.should.be.equal('pic2idx');
   //             });
   //          });
   //       });
   //    });
   // });
});
