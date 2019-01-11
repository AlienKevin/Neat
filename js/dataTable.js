let createTableBtn = document.querySelector("button#createTableBtn");
let rowNumber = 0;
let colNumber = 1; // first column starts from y-0-header, x-header is not included
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
  console.log('cellColumn', cellColumn);
  let cellRow = getRowNumber(cell);
  console.log('cellRow', cellRow);
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
      let cellContent = cell.value;
      if (cellColumn === "x" && cellContent === "") {
        gotoPreviousRow(cell);
        removeTableRow(cell);
      }
      break;
  }
});
/** automatically extend y-header to accomodate longer equations*/
let autoScaleYHeader = function (cellCol) {
  const yHeader = document.getElementById(composeCellId("y", cellCol, "header"));
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
  let currentColNumber = getColNumber(cell);
  let previousCellId;
  if (currentRowNumber > 0) { // after the first non-header row
    previousCellId = composeCellId(currentColumn, currentColNumber, currentRowNumber - 1);
  } else if (currentRowNumber === 0) { // at the first non-header row
    previousCellId = composeCellId(currentColumn, currentColNumber, "header");
  } else if (currentRowNumber === -1) { // at header row
    previousCellId = composeCellId(currentColumn, currentColNumber, "header"); // stay at the same row
  }
  // console.log("previousCellId: " + previousCellId);
  let previousCell = document.getElementById(previousCellId);
  previousCell.focus();
}
let gotoNextRow = function (cell) {
  let currentRowNumber = getRowNumber(cell);
  let currentColumn = getColumn(cell);
  let currentColNumber = getColNumber(cell);
  let nextCellId = composeCellId(currentColumn, currentColNumber, currentRowNumber + 1);
  let nextCell = document.getElementById(nextCellId);
  console.log("nextCell: ", nextCell);
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
/**
 * Get row number of a table cell
 * @param {Element} cell
 * @returns {number} the row number
 */
let getRowNumber = function (cell) {
  let cellId = cell.getAttribute("id");
  let rowNumber = cellId.substring(cellId.lastIndexOf("-") + 1, cellId.length);
  if (rowNumber === "header") {
    return -1; // header's row number is -1, because 0 is the first non-header row
  } else {
    return Number(rowNumber); // other non-header rows have zero-based indexes
  }
}
/**
 * Get column name of a table cell
 * @param {Element} cell
 * @returns {string} "x", or "y"
 */
let getColumn = function (cell) {
  let cellId = cell.getAttribute("id");
  return cellId.substring(0, cellId.indexOf("-"));
}
let getColNumber = function (cell) {
  if (getColumn(cell) === "y") { // only y cells have column numbers
    let cellId = cell.getAttribute("id");
    return Number(cellId.substring(cellId.indexOf("-") + 1, cellId.lastIndexOf("-")));
  } // x cells return undefined
}
/** compose id for table cells,
when cellCol === "x",
a can represent row number then b should be undefined,
a can also be undefined then b should represent row number;
when cellCol === "y",
a is row number,
b is column number
@param {string} cellCol - either "x" or "y"
@param {number} a
@param {number} b
*/
let composeCellId = function (cellCol, a, b) {
  if (cellCol === "x") {
    if (a !== undefined && b === undefined) {
      return "x-" + a;
    } else if (a === undefined && b !== undefined) {
      return "x-" + b;
    }
  } else if (cellCol === "y") {
    return "y-" + a + "-" + b;
  }
}
let getXCell = function (cellRow) {
  let xCellId = composeCellId("x", cellRow);
  let xCell = document.getElementById(xCellId);
  return xCell;
}
let getYCell = function (cellCol, cellRow) {
  let yCellId = composeCellId("y", cellCol, cellRow);
  let yCell = document.getElementById(yCellId);
  return yCell;
}
/** evaluate a selected row in the data table */
let evalTableRow = function (currentRowNumber) {
  let currentXCell = document.getElementById(composeCellId("x", currentRowNumber));
  let currentXValue = currentXCell.value;
  for (let currentColNumber = 0; currentColNumber < colNumber; currentColNumber++) {
    updateEquation(currentColNumber);
    let currentYCell = document.getElementById(composeCellId("y", currentColNumber, currentRowNumber));
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
}
/** evaluate the whole data table*/
let evalTable = function () {
  updateVariable();
  for (let i = 0; i < rowNumber; i++) {
    evalTableRow(i);
  }
}
let updateVariable = function () {
  let xHeaderCell = document.getElementById("x-header");
  xVar = xHeaderCell.value;
}
let updateEquation = function (cellCol) {
  let yHeaderCell = document.getElementById(composeCellId("y", cellCol, "header"));
  equation = yHeaderCell.value;
}

let createXHeader = function () {
  let xCellHeader = document.createElement("input");
  xCellHeader.setAttribute("class", "tableCell");
  xCellHeader.setAttribute("id", "x-header");
  xCellHeader.setAttribute("size", 2);
  xCellHeader.setAttribute("value", "x");
  xCellHeader.setAttribute("spellcheck", false);
  xCellHeader.addEventListener("input", function () {
    evalTable();
  });
  dataTable.appendChild(xCellHeader);
}

let createYHeader = function (cellCol = 0) {
  let yCellHeader = document.createElement("input");
  yCellHeader.setAttribute("class", "tableCell");
  // the first (0th) y-header
  yCellHeader.setAttribute("id", composeCellId("y", cellCol, "header"));
  yCellHeader.setAttribute("size", 10);
  yCellHeader.setAttribute("value", "2x");
  yCellHeader.setAttribute("spellcheck", false);
  yCellHeader.addEventListener("input", function () {
    evalTable();
  });
  if (cellCol > 0) {
    let lastYHeader = document.getElementById(composeCellId("y", cellCol - 1, "header"));
    insertAfter(lastYHeader, yCellHeader);
    // delay incrementing of colNumber to appendTableColumn
  } else {
    let previousXHeader = document.getElementById(composeCellId("x", "header"));
    insertAfter(previousXHeader, yCellHeader);
  }
  // set up auto expansion for table header to accomodate long equations
  autoScaleYHeader(cellCol); // 0 is the first y-header
}

let createTableHeader = function () {
  createXHeader();

  createYHeader();

  // create an add column button
  let addColumnBtn = document.createElement("div");
  addColumnBtn.className = "btn";
  addColumnBtn.id = "addBtn";
  addColumnBtn.innerHTML = "+";
  addColumnBtn.addEventListener("click", function () {
    appendTableColumn();
  });
  dataTable.appendChild(addColumnBtn);

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
  let closeBtn = document.createElement("div");
  closeBtn.className = "btn";
  closeBtn.id = "closeBtn";
  closeBtn.innerHTML = "<span>x</span>";
  closeBtn.addEventListener("click", function () {
    clearElement(dataTable);
    // reset row and column number
    rowNumber = 0;
    colNumber = 1;
  });
  dataTable.appendChild(closeBtn);
  dataTable.appendChild(document.createElement("br")); //create a line break
  createTableRow("x-0"); // create and focus on a new data row
}

let appendTableColumn = function () {
  // first create column header
  createYHeader(colNumber);

  // append a new y-cell at the end of each row
  for (let currentRowNumber = 0; currentRowNumber < rowNumber; currentRowNumber++) {
    createYCell(colNumber, currentRowNumber);
  }

  colNumber++;
}

let createYCell = function (cellCol, cellRow) {
  let yCell = document.createElement("input");
  yCell.setAttribute("class", "tableCell");
  yCell.setAttribute("size", 10);
  yCell.setAttribute("spellcheck", false);
  yCell.setAttribute("id", composeCellId("y", cellCol, cellRow));
  yCell.readOnly = true;
  if (cellCol === 0) {
    let previousCell = document.getElementById(composeCellId("x", cellRow));
    insertAfter(previousCell, yCell);
  } else {
    let previousCell = document.getElementById(composeCellId("y", cellCol - 1, cellRow));
    insertAfter(previousCell, yCell);
  }
}

let createTableRow = function (focusCellId) {
  let xCell = document.createElement("input");
  xCell.setAttribute("class", "tableCell");
  xCell.setAttribute("size", 2);
  xCell.setAttribute("id", composeCellId("x", rowNumber));
  xCell.setAttribute("spellcheck", false);
  dataTable.appendChild(xCell);
  for (let currentColNumber = 0; currentColNumber < colNumber; currentColNumber++) {
    createYCell(currentColNumber, rowNumber);
  }
  dataTable.appendChild(document.createElement("br")); //create a line break
  rowNumber++;
  console.log("focusCellId: " + focusCellId);
  let focusCell = document.getElementById(focusCellId);
  focusCell.focus();
}
let appendRow = function (cell) {
  let focusCellId = composeCellId(getColumn(cell), getColNumber(cell), (rowNumber + 1));
  createTableRow(focusCellId);
}
let removeTableRow = function (cell) {
  let cellRow = getRowNumber(cell);
  if (cellRow === -1) { // header row
    //can't remove header row
  } else {
    // remove the whole row
    let xCell = getXCell(cellRow);
    xCell.remove();
    let linebreak;
    for (let currentColNumber = 0; currentColNumber < colNumber; currentColNumber++) {
      let yCell = getYCell(currentColNumber, cellRow);
      // remove newline break
      linebreak = yCell.nextSibling; // only the last y-cell's next sibling will be preserved
      yCell.remove();
    }
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

// insert a new element as the next sibling of the reference element
// source: https://stackoverflow.com/questions/4793604/how-to-insert-an-element-after-another-element-in-javascript-without-using-a-lib with modification
// author: karim79
function insertAfter(referenceElement, newElement) {
  referenceElement.parentNode.insertBefore(newElement, referenceElement.nextElementSibling);
}