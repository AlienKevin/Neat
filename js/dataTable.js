/* eslint-disable default-case */
{ // restrict all variables and functions
  const dataTable = document.querySelector("div#dataTable");
  const createTableBtn = document.querySelector("button#createTableBtn");
  let rowNumber = 0;
  let colNumber = 1; // first column starts from y-0-header, x-header is not included
  let xVar = "x"; // default independent variable set to "x"
  let equation = "2*x"; // default demo equation
  let inFractions = false; // default result is displayed in decimals

  // clear all childrens of a given element
  // by Gabriel McAdams on StackOverflow
  const clearElement = function (element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  };

  const getCoreWidth = function (element) {
    const cs = getComputedStyle(element);
    const paddingX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const borderX = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
    // Element width minus padding and border
    const elementWidth = element.offsetWidth - paddingX - borderX;
    return elementWidth;
  };

  // insert a new element as the next sibling of the reference element
  // source: https://stackoverflow.com/questions/4793604/how-to-insert-an-element-after-another-element-in-javascript-without-using-a-lib with modification
  // author: karim79
  function insertAfter(referenceElement, newElement) {
    referenceElement.parentNode.insertBefore(newElement, referenceElement.nextElementSibling);
  }
  /**
   * Invalid cell position,
   * not in the format of "x-header" or "x-0" or "y-header-1" or "y-0-0"
   */
  class InvalidCellPositionError extends Error {
    constructor(message) {
      super(message);
      this.name = "InvalidCellPositionError";
    }
  }
  /** compose id for table cells,
  when cellCol === "x",
  a can represent row number then b should be undefined,
  a can also be undefined then b should represent row number;
  when cellCol === "y",
  a is row number,
  b is column number
  @param {String} cellCol - either "x" or "y"
  @param {Number|String} a
  @param {Number|String} b
  */
  const composeCellId = function (cellCol, a, b) {
    if (cellCol === "x") {
      if (a !== undefined && b === undefined) {
        return `x-${a}`;
      }
      if (a === undefined && b !== undefined) {
        return `x-${b}`;
      }
    } else if (cellCol === "y") {
      return `y-${a}-${b}`;
    }
    throw new InvalidCellPositionError(`Cell position of ${cellCol}, ${a}, ${b} is undefined`);
  };

  /**
   * Get row number of a table cell
   * @param {Element} cell
   * @returns {number} the row number
   */
  const getRowNumber = function (cell) {
    const cellId = cell.getAttribute("id");
    const cellRowNumber = cellId.substring(cellId.lastIndexOf("-") + 1, cellId.length);
    if (cellRowNumber === "header") {
      return -1; // header's row number is -1, because 0 is the first non-header row
    }
    return Number(cellRowNumber); // other non-header rows have zero-based indexes
  };
  /**
   * Get column name of a table cell
   * @param {Element} cell
   * @returns {string} "x", or "y"
   */
  const getColumn = function (cell) {
    const cellId = cell.getAttribute("id");
    return cellId.substring(0, cellId.indexOf("-"));
  };
  const getColNumber = function (cell) {
    if (getColumn(cell) === "y") { // only y cells have column numbers
      const cellId = cell.getAttribute("id");
      return Number(cellId.substring(cellId.indexOf("-") + 1, cellId.lastIndexOf("-")));
    }
    // x cells return undefined
    return undefined;
  };

  /**
   * Get the element for x-cell given row number
   * @param {Number|String} cellRow row of the x-cell
   */
  const getXCell = function (cellRow) {
    const xCellId = composeCellId("x", cellRow);
    const xCell = document.getElementById(xCellId);
    return xCell;
  };
  /**
   * Get the element for y-cell given row number and column number
   * @param {Number|String} cellCol column of the y-cell
   * @param {Number|String} cellRow row of the y-cell
   */
  const getYCell = function (cellCol, cellRow) {
    const yCellId = composeCellId("y", cellCol, cellRow);
    const yCell = document.getElementById(yCellId);
    return yCell;
  };
  const createYCell = function (cellCol, cellRow) {
    const yCell = document.createElement("input");
    yCell.setAttribute("class", "tableCell");
    yCell.setAttribute("size", 10);
    yCell.setAttribute("spellcheck", false);
    yCell.setAttribute("id", composeCellId("y", cellCol, cellRow));
    yCell.readOnly = true;
    if (cellCol === 0) {
      const previousCell = document.getElementById(composeCellId("x", cellRow));
      insertAfter(previousCell, yCell);
    } else {
      const previousCell = document.getElementById(composeCellId("y", cellCol - 1, cellRow));
      insertAfter(previousCell, yCell);
    }
  };

  const createTableRow = function (focusCellId) {
    const xCell = document.createElement("input");
    xCell.setAttribute("class", "tableCell");
    xCell.setAttribute("size", 2);
    xCell.setAttribute("id", composeCellId("x", rowNumber));
    xCell.setAttribute("spellcheck", false);
    dataTable.appendChild(xCell);
    for (let currentColNumber = 0; currentColNumber < colNumber; currentColNumber++) {
      createYCell(currentColNumber, rowNumber);
    }
    dataTable.appendChild(document.createElement("br")); // create a line break
    rowNumber++;
    console.log(`focusCellId: ${focusCellId}`);
    const focusCell = document.getElementById(focusCellId);
    focusCell.focus();
  };
  const appendRow = function (cell) {
    const focusCellId = composeCellId(getColumn(cell), getColNumber(cell), (rowNumber + 1));
    createTableRow(focusCellId);
  };
  const decrementRowNumbers = function (cellRow) {
    console.log(`cellRow: ${cellRow}`);
    for (let i = cellRow; i < rowNumber; i++) {
      const xCell = getXCell(i);
      const yCell = getYCell(i);
      const newRowNumber = i - 1;
      xCell.setAttribute("id", `x-${newRowNumber}`);
      yCell.setAttribute("id", `y-${newRowNumber}`);
    }
  };
  const removeTableRow = function (cell) {
    const cellRow = getRowNumber(cell);
    if (cellRow === -1) { // header row
      // can't remove header row
    } else {
      // remove the whole row
      const xCell = getXCell(cellRow);
      xCell.remove();
      let linebreak;
      for (let currentColNumber = 0; currentColNumber < colNumber; currentColNumber++) {
        const yCell = getYCell(currentColNumber, cellRow);
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
  };
  // automatically scale input box to fit long inputs
  // source: https://stackoverflow.com/questions/7168727/make-html-text-input-field-grow-as-i-type by Paulpro with modifications
  const autoScaleInput = function (input, min, max, padRight) {
    if (input !== null) {
      // eslint-disable-next-line no-param-reassign
      input.style.width = `${min}px`;
      input.addEventListener('input', () => {
        console.log("input's content changed!");
        setTimeout(() => {
          const tmp = document.createElement('div');
          tmp.style.padding = '0';
          if (getComputedStyle) {
            tmp.style.cssText = getComputedStyle(input, null).cssText;
          }
          if (input.currentStyle) {
            tmp.style = input.currentStyle;
          }
          tmp.style.width = '';
          tmp.style.position = 'absolute';
          tmp.innerHTML = input.value.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/ /g, '&nbsp;');
          input.parentNode.appendChild(tmp);
          const width = tmp.clientWidth + padRight + 1;
          tmp.parentNode.removeChild(tmp);
          if (min <= width && width <= max) {
            // eslint-disable-next-line no-param-reassign
            input.style.width = `${width}px`;
          } else if (width < min) {
            // eslint-disable-next-line no-param-reassign
            input.style.width = `${min}px`;
          }
        }, 1);
      });
    }
  };
  /** automatically extend y-header to accomodate longer equations */
  const autoScaleYHeader = function (cellCol) {
    const yHeader = document.getElementById(composeCellId("y", cellCol, "header"));
    const vw = document.documentElement.clientWidth; // get the width of the screen
    const headerWidth = getCoreWidth(yHeader); // get the original styled width
    const min = headerWidth;


    const max = Math.floor(vw * 0.7);


    const padRight = 0;
    autoScaleInput(yHeader, min, max, padRight);
  };
  const gotoPreviousRow = function (cell) {
    const currentRowNumber = getRowNumber(cell);
    const currentColumn = getColumn(cell);
    const currentColNumber = getColNumber(cell);
    let previousCellId;
    if (currentRowNumber > 0) { // after the first non-header row
      previousCellId = composeCellId(currentColumn, currentColNumber, currentRowNumber - 1);
    } else if (currentRowNumber === 0) { // at the first non-header row
      previousCellId = composeCellId(currentColumn, currentColNumber, "header");
    } else if (currentRowNumber === -1) { // at header row
      previousCellId = composeCellId(currentColumn, currentColNumber, "header"); // stay at the same row
    }
    // console.log("previousCellId: " + previousCellId);
    const previousCell = document.getElementById(previousCellId);
    previousCell.focus();
  };
  const gotoNextRow = function (cell) {
    const currentRowNumber = getRowNumber(cell);
    const currentColumn = getColumn(cell);
    const currentColNumber = getColNumber(cell);
    const nextCellId = composeCellId(currentColumn, currentColNumber, currentRowNumber + 1);
    const nextCell = document.getElementById(nextCellId);
    console.log("nextCell: ", nextCell);
    if (nextCell !== null) { // next cell exists
      nextCell.focus();
    } else { // next cell doesn't exist
      createTableRow(nextCellId);
    }
  };

  const updateVariable = function () {
    const xHeaderCell = document.getElementById("x-header");
    xVar = xHeaderCell.value;
  };

  const updateEquation = function (cellCol) {
    const yHeaderCell = document.getElementById(composeCellId("y", cellCol, "header"));
    equation = yHeaderCell.value;
  };

  /** evaluate a selected row in the data table */
  const evalTableRow = function (currentRowNumber) {
    const currentXCell = document.getElementById(composeCellId("x", currentRowNumber));
    const currentXValue = currentXCell.value;
    for (let currentColNumber = 0; currentColNumber < colNumber; currentColNumber++) {
      updateEquation(currentColNumber);
      const currentYCell = document.getElementById(composeCellId("y", currentColNumber, currentRowNumber));
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
        const result = nerdamer(equation).evaluate().text(mode);
        console.log(`result: ${result}`);
        currentYCell.value = result;
      }
    }
  };

  dataTable.addEventListener("keyup", (event) => {
    const cell = event.target;
    switch (event.keyCode) {
      case 13: // ENTER key
      case 38: // UP arrow key
      case 40: // DOWN arrow key
        // do nothing
        break;
      default:
        /* beautify preserve:start */
      { // all other keys
        const cellId = event.target.getAttribute("id");
        if (!cellId.endsWith("header")) { // table rows, not header
          const currentRowNumber = getRowNumber(cell);
          evalTableRow(currentRowNumber);
        }
      }
        /* beautify preserve:end */
    }
  });

  /** evaluate the whole data table */
  const evalTable = function () {
    updateVariable();
    for (let i = 0; i < rowNumber; i++) {
      evalTableRow(i);
    }
  };

  const createXHeader = function () {
    const xCellHeader = document.createElement("input");
    xCellHeader.setAttribute("class", "tableCell");
    xCellHeader.setAttribute("id", "x-header");
    xCellHeader.setAttribute("size", 2);
    xCellHeader.setAttribute("value", "x");
    xCellHeader.setAttribute("spellcheck", false);
    xCellHeader.addEventListener("input", () => {
      evalTable();
    });
    dataTable.appendChild(xCellHeader);
  };

  const createYHeader = function (cellCol = 0) {
    const yCellHeader = document.createElement("input");
    yCellHeader.setAttribute("class", "tableCell");
    // the first (0th) y-header
    yCellHeader.setAttribute("id", composeCellId("y", cellCol, "header"));
    yCellHeader.setAttribute("size", 10);
    yCellHeader.setAttribute("value", "2x");
    yCellHeader.setAttribute("spellcheck", false);
    yCellHeader.addEventListener("input", () => {
      evalTable();
    });
    if (cellCol > 0) {
      const lastYHeader = document.getElementById(composeCellId("y", cellCol - 1, "header"));
      insertAfter(lastYHeader, yCellHeader);
      // delay incrementing of colNumber to appendTableColumn
    } else {
      const previousXHeader = document.getElementById(composeCellId("x", "header"));
      insertAfter(previousXHeader, yCellHeader);
    }
    // set up auto expansion for table header to accomodate long equations
    autoScaleYHeader(cellCol); // 0 is the first y-header
  };

  const appendTableColumn = function () {
    // first create column header
    createYHeader(colNumber);

    // append a new y-cell at the end of each row
    for (let currentRowNumber = 0; currentRowNumber < rowNumber; currentRowNumber++) {
      createYCell(colNumber, currentRowNumber);
    }

    colNumber++;
  };

  const createTableHeader = function () {
    createXHeader();

    createYHeader();

    // create an add column button
    const addColumnBtn = document.createElement("div");
    addColumnBtn.className = "btn";
    addColumnBtn.id = "addBtn";
    addColumnBtn.innerHTML = "+";
    addColumnBtn.addEventListener("click", () => {
      appendTableColumn();
    });
    dataTable.appendChild(addColumnBtn);

    // create a fractions/decimals switch button
    // <span class="icon-fractions"></span>
    const fractionsBtn = document.createElement("button");
    fractionsBtn.setAttribute("class", "icon-fractions");
    fractionsBtn.addEventListener("click", () => {
      inFractions = !inFractions;
      if (inFractions === true) {
        fractionsBtn.classList.add("fractionsMode");
        fractionsBtn.classList.remove("decimalsMode");
      } else {
        fractionsBtn.classList.add("decimalsMode");
        fractionsBtn.classList.remove("fractionsMode");
      }
      evalTable();
    });
    dataTable.appendChild(fractionsBtn);
    // create a close button to delete the whole table
    const closeBtn = document.createElement("div");
    closeBtn.className = "btn";
    closeBtn.id = "closeBtn";
    closeBtn.innerHTML = "<span>x</span>";
    closeBtn.addEventListener("click", () => {
      clearElement(dataTable);
      // reset row and column number
      rowNumber = 0;
      colNumber = 1;
    });
    dataTable.appendChild(closeBtn);
    dataTable.appendChild(document.createElement("br")); // create a line break
    createTableRow("x-0"); // create and focus on a new data row
  };

  createTableBtn.addEventListener("click", () => {
    console.log("initializing data table");
    createTableHeader();
  });
  dataTable.addEventListener("keydown", (event) => {
    const cell = event.target;
    const cellColumn = getColumn(cell);
    console.log('cellColumn', cellColumn);
    const cellRow = getRowNumber(cell);
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
      case 8:
        /* beautify preserve:start */
    { // BACKSPACE key
      const cellContent = cell.value;
      if (cellColumn === "x" && cellContent === "") {
        gotoPreviousRow(cell);
        removeTableRow(cell);
      }
      break;
    }
    /* beautify preserve:end */
    }
  });
}
