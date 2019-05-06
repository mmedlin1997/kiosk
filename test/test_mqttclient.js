var should = require('chai').should();

describe('MQTT_kiosk_client', function() {
   var Mqtt_kiosk_client = require('../util/mqtt_kiosk_client');
   
   beforeEach(function() {
   });

   describe('#sendMessage', function() {
      it('should emit onmessage event', function() {
         const url = 'mqtt://localhost:1883';
         const options = {
            clientId: "markmedlin1997",
            clean: true,
         };
         mykiosk = new Mqtt_kiosk_client.MyKiosk(url, options);
         
         var msg = 'testmessage';
         mykiosk.sendMessage('msgs', msg);

         mykiosk.on('onMessage', function() {
            mykiosk.message.should.be.equal(msg);
         })
      });
   });
});

describe('MQTT_server_host', function() {
   var Mqtt_server_host = require('../util/mqtt_server_host');
   const url = 'mqtt://localhost:1883';
   const options = {
      clientId: "markmedlin1997",
      clean: true,
   };

   beforeEach(function() {
      myserver = new Mqtt_server_host.MyServer();
   });

   describe.only('#connect', function() {
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

   describe('#sendMessage', function() {
      it('should emit onmessage event', function() {
         const url = 'mqtt://localhost:1883';
         const options = {
            clientId: "markmedlin1997",
            clean: true,
         };
         myserver = new Mqtt_server_host.MyServer(url, options);
         
         var msg = 'testmessage';
         myserver.sendMessage('msgs', msg);

         myserver.on('onMessage', function() {
            myserver.message.should.be.equal(msg);
         })
      });
   });
});