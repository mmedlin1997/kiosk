const fs = require('fs');

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

function getMostRecentlyOrderedItem(items) {
   var max = new Date(1970);
   var mostRecentItem = '';
   for (let [key, value] of Object.entries(items)) {
      tmp = new Date(value.date);
      if (tmp.getTime() > max.getTime()) {
         mostRecentItem = key;
         max = new Date(value.date);
      }
   }
   console.log('mostRecentItem ', mostRecentItem);

   var item =  {
      cost: "1.00",
      id: "entreeItems-ham",
      image: "./img/burger.png",
      name: "Hamburger",
   };
   item.name += ' (recent)';
   return item;
}

function getMostFrequentlyOrderedItem(items) {
   max = 0;
   mostFrequentItem = '';
   for (let [key, value] of Object.entries(items)) {
      console.log(key, value);
      if (value.qty > max) {
         mostFrequentItem = key;
         max = value.qty;
      }
   }

   var item = {
      cost: "2.00",
      id: "dessertItems-van",
      image: "./img/ice-cream-cone-vanilla.png",
      name: "Vanilla ice cream",
   };
   item.name += ' (frequent)';
   return item;
}

module.exports = {
   orderHistoryToString, 
   updateOrderHistory, 
   openHistoryFile, 
   saveHistoryFile,
   getMostRecentlyOrderedItem,
   getMostFrequentlyOrderedItem,
};