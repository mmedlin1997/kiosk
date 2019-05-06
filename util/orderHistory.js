const fs = require('fs');

// var users = {
//    "mark": {
//       "sid-fri": {
//          date: new Date(2019, 4, 1, 7, 30, 31),
//          qty: 2,
//       },
//       "com-1": {
//          date: new Date(2019, 2, 1, 7, 30, 31),
//          qty: 1,
//       },
//       "des-van": {
//          date: new Date(2019, 3, 1, 7, 30, 31),
//          qty: 3,
//       },
//    }
// };

function orderHistoryToString(user) {
   var str = "";

   for (var item in user) {
      if (user.hasOwnProperty(item)) {
         str += item + ' ';
         str += '(' + user[item]["qty"] + ')';
         str += ' on ' + user[item]["date"] + '\n';
      }
   }
   return str;
}

// Update history by adding new item, and increment date and quantity.
function updateOrderHistory(history, order) {
   console.log('User:\n' + JSON.stringify(history));
   console.log('Order: \n' + JSON.stringify(order));

   for (var i=0; i<order.length; i++) {
      if (history.hasOwnProperty(order[i].id)) {
         history[order[i].id].date = Date();
         history[order[i].id].qty += 1;
         // console.log('History has '+order[i].id);
      }
      else {
         history[order[i].id] = {
            date: Date(),
            qty: 1,
         }
         // console.log('History does not have' + order[i].id);
      }
   }
}

function openHistoryFile(file) {
   try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
   } catch (err) {
      // console.log(err);
      return null;
   }
}

function saveHistoryFile(file, data) {
   fs.writeFile(file, JSON.stringify(data, null, 2) , 'utf8', function(err) {
      if(err) {console.log(err);}
   });
}

module.exports = {orderHistoryToString, updateOrderHistory, openHistoryFile, saveHistoryFile};