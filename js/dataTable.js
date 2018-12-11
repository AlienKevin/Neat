let createTableBtn = document.querySelector("button#createTableBtn");
let rowNumber = 0;
let xVar = "x"; // default independent variable set to "x"
let equation = "2*x"; //default demo equation
createTableBtn.addEventListener("click", function(event){
  console.log("initializing data table");
  createTableHeader();
})
let dataTable = document.querySelector("div#dataTable");
dataTable.addEventListener("keydown", function(event){
  switch(event.keyCode){
    case 13: // ENTER key
      let cellId = event.target.getAttribute("id");
      let newRowNumber;
      let focusCell;
      let idPrefix = cellId.substring(0, cellId.indexOf("-") + 1); // "x-" or "y-"
      if (cellId.endsWith("header")){
        newRowNumber = 0;
      } else{
        newRowNumber = Number(cellId.charAt(cellId.length - 1)) + 1;
      }
      let focusCellId =  idPrefix + newRowNumber;
      createTableRow(focusCellId);
      break;
  }
});
dataTable.addEventListener("keyup", function(event){
  switch(event.keyCode){
    case 13: // ENTER key
    case 38: // UP arrow key
    case 40: // DOWN arrow key
      // do nothing
      break;
    default: // all other keys
      let cellId = event.target.getAttribute("id");
      if (cellId.endsWith("header")){ // table header
        if (cellId.startsWith("x")){
          // set independent var
          xVar = event.target.value;
        } else{
          // set equation used
          equation = event.target.value;
          // update all data values
          console.log("reevaluating all data values");
          for (let i = 0; i < rowNumber; i++){
            evalTableRow(i);
          }
        }
      } else{
        let currentRowNumber = cellId.charAt(cellId.length - 1);
        evalTableRow(currentRowNumber);
      }
  }
});
let evalTableRow = function(currentRowNumber){
  let currentXCell = dataTable.querySelector("#x-" + currentRowNumber);
  let currentXValue = currentXCell.value;
  let currentYCell = dataTable.querySelector("#y-" + currentRowNumber);
  nerdamer.setVar(xVar, currentXValue);
  let result = nerdamer(equation).evaluate().text("decimals");
  currentYCell.setAttribute("value", result);
}
let createTableHeader = function(){
  let xCellHeader = document.createElement("input");
  xCellHeader.setAttribute("class", "tableCell");
  xCellHeader.setAttribute("id", "x-header");
  xCellHeader.setAttribute("size", 2);
  xCellHeader.setAttribute("value", "x");
  let yCellHeader = document.createElement("input");
  yCellHeader.setAttribute("class", "tableCell");
  yCellHeader.setAttribute("id", "y-header");
  yCellHeader.setAttribute("size", 10);
  yCellHeader.setAttribute("value", "2*x");
  dataTable.appendChild(xCellHeader);
  dataTable.appendChild(yCellHeader);
  dataTable.appendChild(document.createElement("br")); //create a line break
  xCellHeader.focus();
}
let createTableRow = function(focusCellId){
  let xCell = document.createElement("input");
  xCell.setAttribute("class", "tableCell");
  xCell.setAttribute("size", 2);
  xCell.setAttribute("id", "x-" + rowNumber);
  let yCell = document.createElement("input");
  yCell.setAttribute("class", "tableCell");
  yCell.setAttribute("size", 2);
  yCell.setAttribute("id", "y-" + rowNumber);
  dataTable.appendChild(xCell);
  dataTable.appendChild(yCell);
  dataTable.appendChild(document.createElement("br")); //create a line break
  rowNumber++;
  console.log("focusCellId: " + focusCellId);
  let focusCell = dataTable.querySelector("input#" + focusCellId);
  focusCell.focus();
}
