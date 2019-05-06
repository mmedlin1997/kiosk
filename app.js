const electron = require('electron');
const path = require('path');
const url = require('url');
const itemMenu = require('./model/itemMenu');
const orderHistory = require('./util/orderHistory');

const {app, BrowserWindow, Menu, ipcMain} = electron;

const historyFile = path.join(__dirname, 'model', 'data.txt')

let mainWindow;
let userOrder;
let currentUser = "mark";

// Listen for app to be ready
app.on('ready', function() {

   // Create new window
   mainWindow = new BrowserWindow({ show: false });
   userOrder = [];

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
ipcMain.on('menu-request', function(e, arg) {
   e.sender.send('menu-response', itemMenu[arg]);
});

ipcMain.on('submenu-request', function(e, arg) {
   e.sender.send('submenu-response', itemMenu[arg]);
});

ipcMain.on('userAdd-request', function(e, arg) {
   var value = search(itemMenu[arg.currentCategory], arg.id);
   userOrder.push(value);
   e.sender.send('userAdd-response', userOrder.length);
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