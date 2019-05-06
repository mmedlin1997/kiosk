const myserver = require('./mqtt_s.js');

const url = 'mqtt://localhost:1883';
const topic = 'pics';

// Connect and subscribe
myserver.connect(url).then(function(resolve){
   myserver.subscribe(topic).then(function(granted) {
      console.log(granted);
   }).catch(function(err) {
      console.log(err);
   });
});

// End
// myserver.connect(url).then(function(){
//    myserver.subscribe(topic).then(function(granted){
//       console.log(granted); 
//    }).then(function() {
//       myserver.end().then(function(){
//          console.log('ended');
//       });
//    }).catch(function(err){
//       console.log(err);
//    });
// });