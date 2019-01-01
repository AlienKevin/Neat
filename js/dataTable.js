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
  let cell = event.target;
  switch(event.keyCode){
    case 13: // ENTER key
      let cellColumn = getColumn(cell);
      let newRowNumber = getRowNumber(cell) + 1;
      let focusCellId =  cellColumn + "-" + newRowNumber;
      createTableRow(focusCellId);
      break;
    case 38: // UP arrow key
      gotoPreviousRow(cell);
      break;
    case 40: // DOWN arrow key
      gotoNextRow(cell);
      break;
    case 8: // BACKSPACE key
      let cellContent = getCellContent(cell);
      if (cellContent === ""){
        gotoPreviousRow(cell);
      }
      break;
  }
});
let getCellId = function(cell){
  return cell.getAttribute("id");
}
let getCellContent = function(cell){
  let cellId = getCellId(cell);
  return dataTable.querySelector("input#" + cellId).value;
}
let gotoPreviousRow = function(cell){
  let currentRowNumber = getRowNumber(cell);
  let currentColumn = getColumn(cell);
  let previousCellId;
  if (currentRowNumber > 0){ // after the first non-header row
    previousCellId = currentColumn + "-" + (currentRowNumber - 1);
  } else if (currentRowNumber === 0){ // at the first non-header row
    previousCellId = currentColumn + "-" + "header";
  } else if (currentRowNumber === -1){ // at header row
    previousCellId = currentColumn + "-" + "header"; // stay at the same row
  }
  // console.log("previousCellId: " + previousCellId);
  let previousCell = dataTable.querySelector("input#" + previousCellId);
  previousCell.focus();
}
let gotoNextRow = function(cell){
  let currentRowNumber = getRowNumber(cell);
  let currentColumn = getColumn(cell);
  let nextCellId = currentColumn + "-" + (currentRowNumber + 1);
  let nextCell = dataTable.querySelector("input#" + nextCellId);
  if (nextCell !== null){ // next cell exists
    nextCell.focus();
  } else{ // next cell doesn't exist
    createTableRow(nextCellId);
  }
}
dataTable.addEventListener("keyup", function(event){
  let cell = event.target;
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
        let currentRowNumber = getRowNumber(cell);
        evalTableRow(currentRowNumber);
      }
  }
});
let getRowNumber = function(cell){
  let cellId = cell.getAttribute("id");
  let rowNumber = cellId.substring(cellId.indexOf("-") + 1, cellId.length);
  if (rowNumber === "header"){
    return -1; // header's row number is -1, because 0 is the first non-header row
  } else{
    return Number(rowNumber); // other non-header rows have zero-based indexes
  }
}
let getColumn = function(cell){
  let cellId = cell.getAttribute("id");
  return cellId.substring(0, cellId.indexOf("-")); // return "x", or "y"
}
let evalTableRow = function(currentRowNumber){
  let currentXCell = dataTable.querySelector("#x-" + currentRowNumber);
  let currentXValue = currentXCell.value;
  let currentYCell = dataTable.querySelector("#y-" + currentRowNumber);
  if (currentXValue === ""){
    currentYCell.value = "";
  } else{
    nerdamer.setVar(xVar, currentXValue);
    let result = nerdamer(equation).evaluate().text("decimals");
    console.log("result: " + result);
    currentYCell.value = result;
  }
}
let createTableHeader = function(){
  let xCellHeader = document.createElement("input");
  xCellHeader.setAttribute("class", "tableCell");
  xCellHeader.setAttribute("id", "x-header");
  xCellHeader.setAttribute("size", 2);
  xCellHeader.setAttribute("value", "x");
  xCellHeader.setAttribute("spellcheck", false);
  let yCellHeader = document.createElement("input");
  yCellHeader.setAttribute("class", "tableCell");
  yCellHeader.setAttribute("id", "y-header");
  yCellHeader.setAttribute("size", 10);
  yCellHeader.setAttribute("value", "2x");
  yCellHeader.setAttribute("spellcheck", false);
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
  xCell.setAttribute("spellcheck", false);
  let yCell = document.createElement("input");
  yCell.setAttribute("class", "tableCell");
  yCell.setAttribute("size", 2);
  yCell.setAttribute("id", "y-" + rowNumber);
  yCell.setAttribute("spellcheck", false);
  yCell.readOnly = true;
  dataTable.appendChild(xCell);
  dataTable.appendChild(yCell);
  dataTable.appendChild(document.createElement("br")); //create a line break
  rowNumber++;
  console.log("focusCellId: " + focusCellId);
  let focusCell = dataTable.querySelector("input#" + focusCellId);
  focusCell.focus();
}
