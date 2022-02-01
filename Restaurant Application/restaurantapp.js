// creating tables
var numberOfTables = 3;
  
let list = document.getElementById("tables");

for(let i = 0; i < numberOfTables; i++){
    let li = document.createElement("li");
    li.setAttribute("id","table"+i);
    li.addEventListener("dragover",()=>{allowDrop(event)});
    li.addEventListener("drop",()=>{addToTable(event,i)});
    li.addEventListener("click",()=>{showOrderOfTable(i)});

    let h2 = document.createElement("h2");
    let txt = document.createTextNode("Table - " + (i+1));
    h2.appendChild(txt);

    let p = document.createElement("p");
    p.setAttribute("id","table" + i + "-p")
    txt = document.createTextNode( "Rs 0 | Total Item(s): 0") ;
    p.appendChild(txt);

    li.appendChild(h2);
    li.appendChild(p);
    list.appendChild(li);
}

//creating menu

// api url
const api_url = "http://localhost:3000/dishes";
        
// Defining async function
async function getapi(url) {   
    // Storing response
    const response = await fetch(url);        
    // Storing data in form of JSON
    var data = await response.json();
    show(data);
}
// Calling that async function
getapi(api_url);
        
// Function to define HTML Menu
function show(menuCard){

    let list = document.getElementById("menu");

    for(let i = 0; i < menuCard.length; i++){
        let li = document.createElement("li");
        li.setAttribute("id","dish"+i);
        li.setAttribute("draggable", "true");
        li.setAttribute("dish", menuCard[i].dish);
        li.setAttribute("price", menuCard[i].price);
        li.addEventListener("dragstart",()=>{drag(event)});


        let h2 = document.createElement("h2");
        let txt = document.createTextNode(menuCard[i].dish);
        h2.appendChild(txt);

        let p = document.createElement("p");
        txt = document.createTextNode( menuCard[i].price) ;
        p.appendChild(txt);

        let h6 = document.createElement("h6");
        h6.setAttribute("class", "invisible");
        txt = document.createTextNode(menuCard[i].category);
        h6.appendChild(txt);

        li.appendChild(h2);
        li.appendChild(p);
        li.appendChild(h6);
        list.appendChild(li);
    }
}


//global variables
const dishes = [[],[],[]], prices = [[],[],[]],quantities = [[],[],[]]; 
var activeTable;

function searchTable() {
  let userInput, list, listItems, listItem, listItemValue, i;
  userInput = document.getElementById('search-table');
  userInput = userInput.value.toUpperCase();
  list = document.getElementById("tables");
  listItems = list.getElementsByTagName('li');

  for (i = 0; i < listItems.length; i++) {
    listItem = listItems[i].getElementsByTagName("h2")[0];
    listItemValue = listItem.textContent;
    if (listItemValue.toUpperCase().indexOf(userInput) > -1) {
      listItems[i].style.display = "";
    } else {
        listItems[i].style.display = "none";
    }
  }
}

function searchMenu() {
    let userInput, list, listItems, dish, category, dishValue, categoryValue, i;
    userInput = document.getElementById('search-menu');
    userInput = userInput.value.toUpperCase();
    list = document.getElementById("menu");
    listItems = list.getElementsByTagName('li');
  
    for (i = 0; i < listItems.length; i++) {
      dish = listItems[i].getElementsByTagName("h2")[0];
      dishValue = dish.textContent;
      category = listItems[i].getElementsByTagName("h6")[0];
      categoryValue = category.textContent;
      if (dishValue.toUpperCase().indexOf(userInput) > -1 || categoryValue.toUpperCase().indexOf(userInput) > -1) {
        listItems[i].style.display = "";
      } else {
          listItems[i].style.display = "none";
      }
    }
  }

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("Text", ev.target.id);
}

//drag and drop dish to table 
function addToTable(event,tableIndex)  {

    event.preventDefault();
    var id = event.dataTransfer.getData("Text");
    var item = document.getElementById(id);

    let dish = item.getAttribute('dish');

    //not a new dish
    if (dishes[tableIndex].indexOf(dish) == -1) {
        dishes[tableIndex].push(dish);
        quantities[tableIndex].push(1);
        prices[tableIndex].push(Number(item.getAttribute('price')));
    }
    //new dish
    else{
        let index = dishes[tableIndex].indexOf(dish);
        quantities[tableIndex][index] = quantities[tableIndex][index] + 1;
    }   

    document.getElementById("table"+tableIndex+"-p").innerHTML = 
        "Rs" +  calculateTotal(prices[tableIndex],quantities[tableIndex]) 
            + " | Total Item(s): " + sum(quantities[tableIndex]);
}

//open modal and show order of the table
function showOrderOfTable(tableIndex) {
    //current table active
    activeTable = tableIndex;

    document.getElementById("table"+tableIndex).style.backgroundColor = "orange";
    document.getElementById("table-number").innerHTML= "Table - " + (tableIndex+1) +  " | Order Details";

    var table = document.getElementById("myTable");

    for (var i = 0; i < dishes[tableIndex].length; i++) {

        var row = table.insertRow(i+1);

        var cell0 = row.insertCell(0);
        var cell1 = row.insertCell(1);
        var cell2 = row.insertCell(2);

        cell0.innerHTML = i+1;
        cell1.innerHTML = dishes[tableIndex][i];
        cell2.innerHTML = prices[tableIndex][i];

        const input= document.createElement("input");
        input.setAttribute("type", "number");
        input.setAttribute("class", "number-input");
        input.setAttribute("value", quantities[tableIndex][i]);
        input.addEventListener("input",()=>{updateItemQuatity(input.value,tableIndex,input)});

        var cell = document.createElement("td");
        cell.appendChild(input);
        row.appendChild(cell);

        const deleteIcon= document.createElement("i");
        deleteIcon.setAttribute("class", "fa fa-trash");
        deleteIcon.addEventListener("click",()=>{deleteRow(deleteIcon,tableIndex)});

        var cell = document.createElement("td");
        cell.appendChild(deleteIcon);
        row.appendChild(cell);
    }

    document.getElementById("bill").innerHTML = calculateTotal(prices[tableIndex],quantities[tableIndex]);
    
    $("#myModal").modal();
}

function closeModal(tableIndex) {
    document.getElementById("table"+tableIndex).style.backgroundColor = "white";
    alert("The bill for Table - " + (activeTable+1) 
        + " is Rs " + calculateTotal(prices[tableIndex],quantities[tableIndex]) + "/-");
    quantities[activeTable] = [];
    prices[activeTable] = [];
    dishes[activeTable] = [];
    document.getElementById("table"+activeTable+"-p").innerHTML = "Rs 0 | Total Item(s): 0";

}

function updateItemQuatity(newQuantity,tableIndex,object){

    let quantityIndex = Number(object.parentNode.parentNode.rowIndex)-1;
    quantities[tableIndex][quantityIndex] = Number(newQuantity);

    document.getElementById("bill").innerHTML = calculateTotal(prices[tableIndex],quantities[tableIndex]);
    document.getElementById("table"+tableIndex+"-p").innerHTML = 
        "Rs" +  calculateTotal(prices[tableIndex],quantities[tableIndex]) 
            + " | Total Item(s): " + sum(quantities[tableIndex]);

}

$('#myModal').on('hide.bs.modal', function (e) {
    var numberOfRows = document.getElementById("myTable").rows.length;
    for (var i = 1; i < numberOfRows; i++) {
        document.getElementById("myTable").deleteRow(1);
    }
    document.getElementById("table"+activeTable).style.backgroundColor = "white";
})

function sum(arr) { 
    let total = 0;
        for (let i = 0; i < arr.length; i++) {
        total += arr[i];
    }
    return total;
}

function calculateTotal(prices,quantities) {
    let total = 0;
    for (var i = 0; i < prices.length; i++) {
        total = total + (prices[i]*quantities[i]);
    }
    return total;
}

function deleteRow(r,tableIndex) {
    var i = r.parentNode.parentNode.rowIndex;
    document.getElementById("myTable").deleteRow(i);

    quantities[tableIndex].splice(i-1,i);
    prices[tableIndex].splice(i-1,i);
    dishes[tableIndex].splice(i-1,i);

    document.getElementById("bill").innerHTML = calculateTotal(prices[tableIndex],quantities[tableIndex]);

    document.getElementById("table"+tableIndex+"-p").innerHTML = 
        "Rs" +  calculateTotal(prices[tableIndex],quantities[tableIndex]) 
            + " | Total Item(s): " + sum(quantities[tableIndex]);
}


