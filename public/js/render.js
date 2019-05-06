const electron = require('electron');
const {ipcRenderer} = electron;

let currentCategory;

// Request the main menu categories on init
document.addEventListener('DOMContentLoaded', function() {
   ipcRenderer.send('menu-request', 'menu');
});

ipcRenderer.on('menu-response', function(e, data) {
   buildMainMenu(data);
});

ipcRenderer.on('submenu-response', function(e, data) {
   buildSubMenu(data);
});

ipcRenderer.on('userAdd-response', function(e, data) {
   updateBasketButtonQty(data);
});

ipcRenderer.on('basketItems-response', function(e, data) {
   showBasketSummary(data);
   updateBasketButtonQty(data.length);
});

ipcRenderer.on('placeOrderItem-response', function(e, data) {
   showMessageCard("Thank you for your order.");
   updateBasketButtonQty(data);
});

function onMouseIn(element) {
   element.className = "card orange darken-1";
}
function onMouseOut(element) {
   element.className = "card blue-grey darken-1";
}

// On main menu item click, clear and request sub menu
function onMainMenuClick(id) {
   document.querySelector(".subMenu").innerHTML = '';
   ipcRenderer.send('submenu-request', id);
   currentCategory = id;
}

// On sub menu item click, clear and request sub menu
function onSubMenuClick(id) {
   ipcRenderer.send('userAdd-request', {currentCategory, id});
}

function onBasketButtonClick() {
   ipcRenderer.send('basketItems-request', null);
}

function onRemoveItem(id) {
   ipcRenderer.send('removeOrderItem-request', id);
}

function onCameraButtonClick() {
   
}

function onPlaceOrderButtonClick() {
   ipcRenderer.send('placeOrderItem-request', null);
}

function onCancelOrderButtonClick() {
   ipcRenderer.send('removeAllItem-request', null);
}

// Create main menu of category cards
function buildMainMenu(menuList) {
   menuList.forEach(function(element) {
      
      var cardTitle = document.createElement("span");
      cardTitle.className += "card-title";
      cardTitle.textContent = element.name;

      var cardImage = document.createElement("img");
      cardImage.setAttribute("src", element.image);

      var cardContent = document.createElement("div");
      cardContent.className += "card-content white-text";
      cardContent.appendChild(cardTitle);
      cardContent.appendChild(cardImage);

      var card = document.createElement("div");
      card.className += "card blue-grey darken-1";
      card.setAttribute("id", element.id);
      card.setAttribute("onmouseover", "onMouseIn(this)");
      card.setAttribute("onmouseout", "onMouseOut(this)");
      card.setAttribute("onclick", "onMainMenuClick(this.id)");
      card.appendChild(cardContent);

      var category = document.createElement("div");
      category.className += "col s2";
      category.appendChild(card);

      document.querySelector(".mainMenu").appendChild(category);
   });
}

// Create submenu DOM elements
function buildSubMenu(data) {
   data.forEach(function(element) {
      
      var cardTitle = document.createElement("span");
      cardTitle.className += "card-title white-text";
      cardTitle.textContent = element.name;

      var image = document.createElement("img");
      image.setAttribute("src", element.image);
      image.setAttribute("width", 100);
      var cardImage = document.createElement("div");
      cardImage.className += "col s12 m12 l12";
      cardImage.appendChild(image);

      var cardText = document.createElement("h4");
      cardText.textContent = "$ " + element.cost;
      var cardContent = document.createElement("div");
      cardContent.className += "card-content white-text";
      cardContent.appendChild(cardTitle);
      cardContent.appendChild(cardImage);
      cardContent.appendChild(cardText);

      var card = document.createElement("div");
      card.className += "card med blue-grey darken-1";
      card.setAttribute("id", element.id);
      card.setAttribute("onmouseover", "onMouseIn(this)");
      card.setAttribute("onmouseout", "onMouseOut(this)");
      card.setAttribute("onclick", "onSubMenuClick(this.id)");
      card.appendChild(cardContent);

      var category = document.createElement("div");
      category.className += "col s3 m3 l3";
      category.appendChild(card);

      document.querySelector(".subMenu").appendChild(category);
   })
};

// Update basket items button 
function updateBasketButtonQty(data) {
   var icon = document.createElement("i");
      icon.className += "material-icons right";
      icon.textContent = "shopping_basket";

   var button = document.getElementById("basketButton")
      button.textContent = 'Items ';
      if(data > 0) {      
         button.textContent += '(' + data + ')';
      }
      button.appendChild(icon);
};

// Show basket items
function showBasketSummary(data) {
   document.querySelector(".subMenu").innerHTML = '';
   
   // Handle case where no items in basket
   if (data == null || data.length == 0) {
      showMessageCard("You don't have any items right now.");
      // var message = document.createElement("h1");
      // message.innerHTML += "You don't have any items right now.";
      // document.querySelector(".subMenu").appendChild(message);
      return;
   }

   var orderDiv = generateTotalOrderSummary(data);
   var table = generateBasketTable(data);

   var div = document.createElement("div");
   div.className += "card-panel flow-text";
   div.appendChild(orderDiv);
   div.appendChild(table);

   document.querySelector(".subMenu").appendChild(div);
};

// Generate a table of basket items
function generateBasketTable(data) {
   var header = "<tr>";
   header += "<th>Item</th>";
   header += "<th>Name</th>";
   header += "<th>Cost</th>";
   header += "<th>Remove</th>"
   header += "</tr>";
   var thead = document.createElement("thead");
   thead.innerHTML += header;

   var body = "";
   for (var i=0; i<data.length; i++) {
      var button = "<a class='waves-effect waves-light btn red darken-1' id='" + i + "' onclick='onRemoveItem(id)'><i class='material-icons center'>remove</i></a>";

      body += "<tr>";
      body += "<td>" + (i+1) + "</td>";
      body += "<td>" + data[i].name + "</td>";
      body += "<td>$" + data[i].cost + "</td>";
      body += "<td>" + button + "</td>"; 
      body += "</tr>";
   }
   var tbody = document.createElement("tbody");
   tbody.innerHTML += body;

   var table = document.createElement("table");
   table.className += "striped bordered"; // striped bordered, responsive-table
   table.appendChild(thead);
   table.appendChild(tbody);

   return table;
}

// Calculate total order
function generateTotalOrderSummary(data) {
   var textDiv = document.createElement("div");
   textDiv.className += "col s6 m4 l6";
   textDiv.innerHTML += "<h4>Total: $ " + getTotalCost(data) + "</h4>";
   var button1Div = document.createElement("div");
   button1Div.className += "col s6 m4 l3";
   button1Div.innerHTML += "<a class='waves-effect waves-light btn-large green darken-1' onclick='onPlaceOrderButtonClick()'>Place Order</a>";
   var button2Div = document.createElement("div");
   button2Div.className += "col s6 m4 l3";
   button2Div.innerHTML += "<a class='waves-effect waves-light btn-large red darken-1' onclick='onCancelOrderButtonClick()'>Cancel Order</a>";

   var rowDiv = document.createElement("div");
   rowDiv.className += "row valign-wrapper";
   rowDiv.appendChild(button1Div);
   rowDiv.appendChild(textDiv);
   rowDiv.appendChild(button2Div);

   var containerDiv = document.createElement("div");
   containerDiv.className += "container";
   containerDiv.appendChild(rowDiv);

   return containerDiv;
}

// Calculate order total cost
function getTotalCost(data) {
   var total = 0;
   data.forEach(function(element) {
      total += parseInt(element.cost);
   });
   
   return total.toFixed(2);
}

// Show message card
function showMessageCard(message) {
   var cardTitleSpan = document.createElement("span");
   cardTitleSpan.className += "card-title white-text";
   cardTitleSpan.innerText += message;

   var cardDiv = document.createElement("div");
   cardDiv.className += "card blue-grey darken-1 center-align";
   cardDiv.appendChild(cardTitleSpan);

   document.querySelector(".subMenu").innerHTML = '';
   document.querySelector(".subMenu").appendChild(cardDiv);
   return;
}