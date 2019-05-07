const amqp = require('amqplib/callback_api');
const fs = require('fs');
const should = require('chai').should();

describe('AMQP loopback tests', function() {
   describe('using remotehost', function() {
      
      const url = {
         protocol: 'amqp', 
         hostname: 'caterpillar.rmq.cloudamqp.com', 
         port: 5672, 
         username: 'xinqyzfz', 
         password: 'SQ182Zz-N1v2BJw49cXx-YlrIfuSsnw8', 
         vhost: 'xinqyzfz'
      };
      const serverQueues = 'pics';
      const clientQueue = 'reks';

      var serverConn, clientConn;
      var serverChan, clientChan;

      // Set up connections
      beforeEach(function(done) {
         server = amqp.connect(url, function(err, conn) {
            if(err) { console.log(err)}
            serverConn = conn;
            conn.createChannel(function(error1, channel) {
               if(error1) { console.log(error1)}
               serverChan = channel;
               channel.assertQueue('reks', {durable: false});

               channel.consume('pics', function(msg) {
                  var json = msg.content.toString();
                  var data = JSON.parse(json);
                  data.time1 = getNanoSecTime();
                  data.payload = "person_id";
                  channel.sendToQueue('reks', Buffer.from(JSON.stringify(data)));
               }, {noAck:true});
            });
          
            // Connect client last
            client = amqp.connect(url, function(err, conn) {
               if(err) { console.log(err)}
               clientConn = conn;
               conn.createChannel(function(err, channel) {
                  clientChan = channel;
                  channel.assertQueue('reks', {durable: false});
                  done();
               });
            });
         });
      });

      // End connections
      afterEach(function(done) {
         clientConn.close(function() {
            serverConn.close( function () {
               done();
            });
         });
      });

      it('should publish an image and get a response', function(done) {
         var filename = 'image400x600.jpg';
         let msg = {
            filename: filename,
            payload: fs.readFileSync(__dirname + '/' + filename),
            time0: getNanoSecTime(),
            time1: null,
            time2: null,
         };
         clientChan.sendToQueue('pics', Buffer.from(JSON.stringify(msg)), {noAck:true});
         clientChan.consume('reks', function(message) {
            var json = message.content.toString();
            var data = JSON.parse(json);
            data.time2 = getNanoSecTime();
            
            // Results
            data.filename.should.be.equal(filename);
            // console.log(JSON.stringify(data));
            console.log('Out: ' + ((data.time1-data.time0)/1000000) + 'ms');
            console.log('Back: ' + ((data.time2-data.time1)/1000000) + 'ms');
            console.log('RTT: ' + ((data.time2-data.time0)/1000000) + 'ms');
            done();
         });
      });
   });
});

// Helper functions
function getNanoSecTime() {
   var hrTime = process.hrtime();
   return hrTime[0] * 1000000000 + hrTime[1];
}