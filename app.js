const electron = require('electron');
const path = require('path');
const url = require('url');
const itemMenu = require('./model/itemMenu');
const orderHistory = require('./util/orderHistory');

const {app, BrowserWindow, Menu, ipcMain} = electron;

const historyFile = path.join(__dirname, 'model', 'userHistory.txt')

let mainWindow;
let userOrder;
let currentUser;

// Listen for app to be ready
app.on('ready', function() {

   // Create new window
   mainWindow = new BrowserWindow({ show: false });
   userOrder = [];
   currentUser = null;
   
   // Make sure order history db is initialized
   var usersOrderHistory = orderHistory.openHistoryFile(historyFile);
   if (!usersOrderHistory) {
      usersOrderHistory = {users:{}};
      orderHistory.saveHistoryFile(historyFile, usersOrderHistory);
   }

   // Show window when ready
   mainWindow.once('ready-to-show', function() {
      mainWindow.show();
      mainWindow.maximize();
   });

   // Load html in window, ex: file://path/to/index.hmtl
   mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'public', 'index.html'),
      protocol: 'file',
      slashes: true,
   }));

   // Quit app when closed, including all sub windows 
   mainWindow.on('closed', function() {
      app.quit();
   });
});

// Handle requests from front end
ipcMain.on('mainMenu-request', function(e, arg) {
   e.sender.send('mainMenu-response', itemMenu[arg]);
});

ipcMain.on('subMenu-request', function(e, arg) {
   e.sender.send('subMenu-response', itemMenu[arg]);
});

ipcMain.on('userMenu-request', function(e, img) {
   currentUser = idUserFromImg(img);
   userMenu = buildUserMenu(currentUser);
   e.sender.send('userMenu-response', userMenu);
});

ipcMain.on('addItemToOrder-request', function(e, id) {
   var category = id.split('-')[0];
   var value = search(itemMenu[category], id);
   userOrder.push(value);
   e.sender.send('addItemToOrder-response', userOrder.length);
});

ipcMain.on('basketItems-request', function(e, arg) {
   e.sender.send('basketItems-response', userOrder);
});

ipcMain.on('removeOrderItem-request', function(e, index) {
   userOrder.splice(index, 1);
   e.sender.send('basketItems-response', userOrder);
});

ipcMain.on('placeOrderItem-request', function(e) {
   
   // Get order history
   var usersOrderHistory = orderHistory.openHistoryFile(historyFile);
   if (!usersOrderHistory) {
      usersOrderHistory = {users:{}};
      orderHistory.saveHistoryFile(historyFile, usersOrderHistory);
   }

   // If current user not identified, finish order without history logging
   if (!currentUser) {
      userOrder.length = 0;
      e.sender.send('placeOrderItem-response', userOrder.length);
      return;
   }

   // Add current user if not in history
   if ( !(currentUser in usersOrderHistory.users) ) {
      usersOrderHistory.users[currentUser] = {};
   }

   // Update order history and save
   orderHistory.updateOrderHistory(usersOrderHistory.users[currentUser], userOrder);
   orderHistory.saveHistoryFile(historyFile, usersOrderHistory);

   // Clear order and update front end
   userOrder.length = 0;
   e.sender.send('placeOrderItem-response', userOrder.length); 
});

ipcMain.on('removeAllItem-request', function(e, index) {
   userOrder.length = 0;
   e.sender.send('basketItems-response', userOrder);
});

// Search array for id containing element
function search(ary, element) {
   for (var i=0; i<ary.length; i++) {
      if (ary[i].id == element) {
         return ary[i];
      }
   }
}

// Check if object is empty
function isEmpty(obj) {
   for(var key in obj) {
      if(obj.hasOwnProperty(key))
         return false;
   }
}

// Determine user from image
function idUserFromImg() {
   // Send to AWS REK, and get user id
   var rekognized = true;

   if (rekognized) {
      return 'mark'
   } else {
      return null;
   }
}

// Build user menu for specific user
function buildUserMenu(user) {
   var userMenu = [];
  
   // Get order history
   var usersOrderHistory = orderHistory.openHistoryFile(historyFile);
   
   // If no history, return empty menu 
   if ( !(user in usersOrderHistory.users) ) {
      return userMenu;
   }

   // Fill out user menu
   var tmp = usersOrderHistory.users[user];
   var recentItem = orderHistory.getMostRecentlyOrderedItem(tmp);
   var frequentItem = orderHistory.getMostFrequentlyOrderedItem(tmp);
   
   var index1 = recentItem.split('-')[0];
   var recentItemObject = findItemInMenuList(itemMenu[index1], recentItem);
   recentItemObject.name += ' (most recent)';

   var index2 = frequentItem.split('-')[0];
   var frequentItemObject = findItemInMenuList(itemMenu[index2], frequentItem);
   frequentItemObject.name += ' (most often)';

   return [recentItemObject, frequentItemObject];
}

function findItemInMenuList(menuList, searchItem) {
   for (let i=0; i<menuList.length; i++) {
      if (menuList[i].id == searchItem) {
         return clone(menuList[i]);
      }
   } 
}

// Clone an object
function clone(obj) {
   if (null == obj || "object" != typeof obj) return obj;
   var copy = obj.constructor();
   for (var attr in obj) {
       if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
   }
   return copy;
}
