let createTableBtn = document.querySelector("button#createTableBtn");
let rowNumber = 0;
let xVar = "x"; // default independent variable set to "x"
let equation = "2*x"; //default demo equation
let inFractions = false; // default result is displayed in decimals
createTableBtn.addEventListener("click", function (event) {
  console.log("initializing data table");
  createTableHeader();
})
let dataTable = document.querySelector("div#dataTable");
dataTable.addEventListener("keydown", function (event) {
  let cell = event.target;
  let cellColumn = getColumn(cell);
  let cellRow = getRowNumber(cell);
  switch (event.keyCode) {
    case 13: // ENTER key
      if (cellRow === rowNumber) { // last row
        appendRow(cell);
      } else {
        gotoNextRow(cell);
      }
      break;
    case 38: // UP arrow key
      gotoPreviousRow(cell);
      break;
    case 40: // DOWN arrow key
      gotoNextRow(cell);
      break;
    case 8: // BACKSPACE key
      let cellContent = getCellContent(cell);
      if (cellColumn === "x" && cellContent === "") {
        gotoPreviousRow(cell);
        removeTableRow(cell);
      }
      break;
  }
});
// automatically extend y-header to accomodate longer equations
let autoScaleYHeader = function () {
  const yHeader = document.querySelector('#y-header');
  const vw = document.documentElement.clientWidth; // get the width of the screen
  const headerWidth = getCoreWidth(yHeader); // get the original styled width
  const min = headerWidth,
    max = Math.floor(vw * 0.7),
    pad_right = 0;
  autoScaleInput(yHeader, min, max, pad_right);
}

// automatically scale input box to fit long inputs
// source: https://stackoverflow.com/questions/7168727/make-html-text-input-field-grow-as-i-type by Paulpro with modifications
let autoScaleInput = function (input, min, max, pad_right) {
  if (input !== null) {
    input.style.width = min + 'px';
    input.addEventListener('input', function () {
      console.log("input's content changed!");
      var input = this;
      setTimeout(function () {
        var tmp = document.createElement('div');
        tmp.style.padding = '0';
        if (getComputedStyle)
          tmp.style.cssText = getComputedStyle(input, null).cssText;
        if (input.currentStyle)
          tmp.style = input.currentStyle;
        tmp.style.width = '';
        tmp.style.position = 'absolute';
        tmp.innerHTML = input.value.replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;")
          .replace(/ /g, '&nbsp;');
        input.parentNode.appendChild(tmp);
        var width = tmp.clientWidth + pad_right + 1;
        tmp.parentNode.removeChild(tmp);
        if (min <= width && width <= max) {
          input.style.width = width + 'px';
        } else if (width < min) {
          input.style.width = min + 'px';
        }
      }, 1);
    });
  }
};
let gotoPreviousRow = function (cell) {
  let currentRowNumber = getRowNumber(cell);
  let currentColumn = getColumn(cell);
  let previousCellId;
  if (currentRowNumber > 0) { // after the first non-header row
    previousCellId = currentColumn + "-" + (currentRowNumber - 1);
  } else if (currentRowNumber === 0) { // at the first non-header row
    previousCellId = currentColumn + "-" + "header";
  } else if (currentRowNumber === -1) { // at header row
    previousCellId = currentColumn + "-" + "header"; // stay at the same row
  }
  // console.log("previousCellId: " + previousCellId);
  let previousCell = dataTable.querySelector("input#" + previousCellId);
  previousCell.focus();
}
let gotoNextRow = function (cell) {
  let currentRowNumber = getRowNumber(cell);
  let currentColumn = getColumn(cell);
  let nextCellId = currentColumn + "-" + (currentRowNumber + 1);
  let nextCell = dataTable.querySelector("input#" + nextCellId);
  if (nextCell !== null) { // next cell exists
    nextCell.focus();
  } else { // next cell doesn't exist
    createTableRow(nextCellId);
  }
}
dataTable.addEventListener("keyup", function (event) {
  let cell = event.target;
  switch (event.keyCode) {
    case 13: // ENTER key
    case 38: // UP arrow key
    case 40: // DOWN arrow key
      // do nothing
      break;
    default: // all other keys
      let cellId = event.target.getAttribute("id");
      if (!cellId.endsWith("header")) { // table rows, not header
        let currentRowNumber = getRowNumber(cell);
        evalTableRow(currentRowNumber);
      }
  }
});
let getRowNumber = function (cell) {
  let cellId = cell.getAttribute("id");
  let rowNumber = cellId.substring(cellId.indexOf("-") + 1, cellId.length);
  if (rowNumber === "header") {
    return -1; // header's row number is -1, because 0 is the first non-header row
  } else {
    return Number(rowNumber); // other non-header rows have zero-based indexes
  }
}
let getColumn = function (cell) {
  let cellId = cell.getAttribute("id");
  return cellId.substring(0, cellId.indexOf("-")); // return "x", or "y"
}
let getCellId = function (cell) {
  return cell.getAttribute("id");
}
let getCellContent = function (cell) {
  let cellId = getCellId(cell);
  return dataTable.querySelector("input#" + cellId).value;
}
let getXCell = function (cellRow) {
  let xCellId = "x-" + cellRow;
  let xCell = dataTable.querySelector("input#" + xCellId);
  return xCell;
}
let getYCell = function (cellRow) {
  let yCellId = "y-" + cellRow;
  let yCell = dataTable.querySelector("input#" + yCellId);
  return yCell;
}
// evaluate a selected row in the data table
let evalTableRow = function (currentRowNumber) {
  let currentXCell = dataTable.querySelector("#x-" + currentRowNumber);
  let currentXValue = currentXCell.value;
  let currentYCell = dataTable.querySelector("#y-" + currentRowNumber);
  if (currentXValue === "") {
    currentYCell.value = "";
  } else {
    nerdamer.setVar(xVar, currentXValue);
    let mode;
    if (inFractions) {
      mode = "fractions";
    } else {
      mode = "decimals";
    }
    let result = nerdamer(equation).evaluate().text(mode);
    console.log("result: " + result);
    currentYCell.value = result;
  }
}
// evaluate the whole data table
let evalTable = function () {
  updateVariable();
  updateEquation();
  for (let i = 0; i < rowNumber; i++) {
    evalTableRow(i);
  }
}
let updateVariable = function () {
  let xHeaderCell = dataTable.querySelector("#x-header");
  xVar = xHeaderCell.value;
}
let updateEquation = function () {
  let yHeaderCell = dataTable.querySelector("#y-header");
  equation = yHeaderCell.value;
}
let createTableHeader = function () {
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
  xCellHeader.addEventListener("input", function () {
    evalTable();
  });
  yCellHeader.addEventListener("input", function () {
    evalTable();
  });
  dataTable.appendChild(xCellHeader);
  dataTable.appendChild(yCellHeader);
  // set up auto expansion for table header to accomodate long equations
  autoScaleYHeader();
  // create a fractions/decimals switch button
  // <span class="icon-fractions"></span>
  let fractionsBtn = document.createElement("button");
  fractionsBtn.setAttribute("class", "icon-fractions");
  fractionsBtn.addEventListener("click", function () {
    inFractions = !inFractions;
    if (inFractions === true) {
      fractionsBtn.classList.add("fractionsMode");
      fractionsBtn.classList.remove("decimalsMode");
    } else {
      fractionsBtn.classList.add("decimalsMode");
      fractionsBtn.classList.remove("fractionsMode");
    }
    evalTable();
  })
  dataTable.appendChild(fractionsBtn);
  // create a close button to delete the whole table
  let closeBtn = document.createElement("span");
  closeBtn.setAttribute("class", "close");
  closeBtn.innerHTML = "x";
  closeBtn.addEventListener("click", function () {
    clearElement(dataTable);
  });
  dataTable.appendChild(closeBtn);
  dataTable.appendChild(document.createElement("br")); //create a line break
  createTableRow("x-0"); // create and focus on a new data row
}
let createTableRow = function (focusCellId) {
  let xCell = document.createElement("input");
  xCell.setAttribute("class", "tableCell");
  xCell.setAttribute("size", 2);
  xCell.setAttribute("id", "x-" + rowNumber);
  xCell.setAttribute("spellcheck", false);
  let yCell = document.createElement("input");
  yCell.setAttribute("class", "tableCell");
  yCell.setAttribute("size", 10);
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
let appendRow = function (cell) {
  let focusCellId = cellColumn + "-" + (rowNumber + 1);
  createTableRow(focusCellId);
}
let removeTableRow = function (cell) {
  let cellRow = getRowNumber(cell);
  if (cellRow === -1) { // header row
    //can't remove header row
  } else {
    // remove the whole row
    let xCell = getXCell(cellRow);
    let yCell = getYCell(cellRow);
    // remove newline break
    let linebreak = yCell.nextSibling;
    xCell.remove();
    yCell.remove();
    decrementRowNumbers(cellRow + 1);
    rowNumber--;
    if (linebreak.tagName.toUpperCase() === "BR") { // check if the element is a linebreak
      linebreak.remove();
    }
  }
}
let decrementRowNumbers = function (cellRow) {
  console.log("cellRow: " + cellRow);
  for (let i = cellRow; i < rowNumber; i++) {
    let xCell = getXCell(i);
    let yCell = getYCell(i);
    let newRowNumber = i - 1;
    xCell.setAttribute("id", "x-" + newRowNumber);
    yCell.setAttribute("id", "y-" + newRowNumber);
  }
}
// clear all childrens of a given element
// by Gabriel McAdams on StackOverflow
let clearElement = function (element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

let getCoreWidth = function (element) {
  var cs = getComputedStyle(element);
  var paddingX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
  var borderX = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
  // Element width minus padding and border
  elementWidth = element.offsetWidth - paddingX - borderX;
  return elementWidth;
}
let getCoreHeight = function (element) {
  var cs = getComputedStyle(element);
  var paddingY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  var borderY = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
  // Element width minus padding and border
  elementHeight = element.offsetHeight - paddingY - borderY;
  return elementHeight;
}