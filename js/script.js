// initialize MathQuill
const MQ = MathQuill.getInterface(2);
// retrieve mathField which contains all input and output boxes
const mathField = document.querySelector("#mathField");
// the enumerated number sequence of input, used to generate ids for input boxes
let inputNumber = 0; // 0 means the first input (zero-based index)
// an array of associated Mathquill API Objects of output boxes
const outputMQs = [];
// an array of assoicated Guppy API Objects of input boxes
const guppies = [];
// precision of the number of decimal places to retain
// eslint-disable-next-line prefer-const
let precision = 5;
// maximum precision allowed
// eslint-disable-next-line no-unused-vars
const MAX_PRECISION = 12;
// the number of digits required to convert the result to exponent form
// eslint-disable-next-line no-unused-vars
const EXPONENT_MIN = 9;
// convert to LaTeX or not
const converToLaTexDefault = true;
let convertToLaTeX = converToLaTexDefault;
// display in LaTeX or not
const displayInLaTeXDefault = true;
let displayInLaTeX = displayInLaTeXDefault;
// whether to copy on double click of output boxes or not
// eslint-disable-next-line prefer-const
let copyOnDoubleClick = false;

// create initial input and output on page load
document.addEventListener("DOMContentLoaded", () => createNewField());

// listen for double click on output boxes to copy the content in them
mathField.addEventListener("dblclick", (event) => {
  // // console.log("output dblclicked!");
  const target = event.target;
  const OFFSET = 1; // skip over the first "equal sign"
  for (let i = 0; i < inputNumber; i++) { // the number of outputs is equal to the number of inputs
    const currentOutput = document.getElementById(composeId("output", i));
    if (currentOutput.contains(target)) { // target element inside the output
      const rootBlock = currentOutput.querySelector("span.mq-root-block");
      let selectionWrapper = rootBlock.querySelector("span.mq-selection");
      if (selectionWrapper && rootBlock.childElementCount === OFFSET + 1) {
        // rootBlock's elements are all selected, excep the first "equal sign"
        // do nothing
      } else {
        selectionWrapper = document.createElement("span");
        selectionWrapper.classList.add("mq-selection");
        wrapAll(Array.from(rootBlock.childNodes).slice(OFFSET), selectionWrapper);
        const outputMQ = outputMQs[i];
        const result = outputMQ.latex().substring(OFFSET);
        const textarea = rootBlock.querySelector("span.mq-textarea");
        if (textarea) {
          textarea.remove();
        }
        if (copyOnDoubleClick) {
          copyStringToClipboard(result);
        } else {
          selectString(result);
        }
      }
    }
  }
});
document.addEventListener("click", () => {
  const OFFSET = 1; // skip over the first "equal sign"
  for (let i = 0; i < inputNumber; i++) { // the number of outputs is equal to the number of inputs
    const currentOutput = document.getElementById(composeId("output", i));
    const rootBlock = currentOutput.querySelector("span.mq-root-block");
    if (rootBlock) {
      const selectionWrapper = rootBlock.querySelector("span.mq-selection");
      if (selectionWrapper && rootBlock.childElementCount === OFFSET + 1) {
        // rootBlock's elements are all selected, except the first "equal sign"
        unwrap(selectionWrapper);
      }
    }
  }
});

// evaluate expression inside an input box
function evalExpr(input) {
  const expr = getValue(input);
  // console.log(`expr: ${expr}`);
  let result = handleSolveEquations(expr);
  if (result === false) {
    // let result = nerdamer.convertToLaTeX(nerdamer(expr).evaluate().text()).toString();
    // let result = nerdamer(expr).evaluate().text("decimal").toString();
    // let result = nerdamer(expr).evaluate().toTeX("decimal");
    try {
      result = nerdamer(expr, undefined, ["numer"]);
      if (result.symbol !== undefined && result.symbol.value === "#") {
        // console.log("result.symbol is valid");
        const decimalResult = Number(result.evaluate().text("decimals"));
        if (Number.isFinite(decimalResult)) { // result is a valid number, not Infinity or NaN
          // console.log("result is a valid number");
          const exponentialResult = decimalResult.toExponential(precision);
          const significantFigures = decimalResult.toExponential().indexOf("e");
          const resultLength = decimalResult.toString().length;
          const exponent = exponentialResult.substring(exponentialResult.indexOf("e") + 1);
          if (exponent.charAt(0) === "-") { // negative exponent, a small decimal number
            // number in the exponent without +/- sign
            const exponentMagnitude = exponent.substring(1);
            if (Number(exponentMagnitude) > precision) {
              result = exponentialResult; // return the result in form of exponential
            } else {
              // console.log(`toFixed precision length: ${precision + (resultLength - significantFigures)}`);
              result = decimalResult.toFixed(precision + (resultLength - significantFigures));
            }
          } else { // positive exponent
            // console.log("exponent of result is positive");
            result = decimalResult.toFixed(precision);
          }
          // remove trailing zero
          result = parseFloat(result).toString();
        }
      }
    } catch (e) {
      result = "undefined"; // error like 1/0 (division by 0 not allowed)
      displayInLaTeX = false;
    }
    // if (result == ""){
    //     result = nerdamer(expr).evaluate().toString();
    // }
  }
  removeImagineryResults(result);
  removeDuplicatedResults(result);
  // console.log(`result after removing imagineries: ${result}`);
  // convert fractions in result to decimals
  // result = result.text("decimal");
  // separate long result outputs into multiple lines
  if (result.length > 30) {
    result = result.replace(/,/g, ",<br>");
  }
  // console.log(`result: ${result}`);

  return result;
}

function updateOutput(currentInput, event) {
  const currentInputNumber = getNumber(currentInput);
  const currentOutput = getOutput(currentInputNumber);
  // if key pressed is BACKSPACE and current input box is empty, return immediately
  if (event !== undefined && event.keyCode === 8 && currentInput.value === "") {
    currentOutput.innerHTML = "";
    return;
  }
  if (currentOutput !== null) {
    let result = evalExpr(currentInput);
    if (result instanceof Error) { // an error object
      // console.log("error: ", result);
      currentOutput.innerHTML = '<div id="errorIcon" class="material-icons" style="font-size: 40px; position: relative; top: 10px">warning</div>'; // warning symbol
      const errorIcon = currentOutput.querySelector("div#errorIcon");
      errorIcon.className += " not-selectable"; // set error icon to be not selectable
      currentOutput.addEventListener("mousemove", () => {
        const errorMsg = currentOutput.querySelector("div.errorMsg");
        if (isHovered(errorIcon)) {
          // // console.log("errorMsg is hovered");
          if (errorMsg === null) {
            const newErrorMsg = document.createElement("div");
            newErrorMsg.setAttribute("class", "errorMsg not-selectable");
            newErrorMsg.innerHTML = result.message;
            currentOutput.appendChild(newErrorMsg);
          }
        } else if (errorMsg !== null) {
          errorMsg.remove();
        }
      });
    } else {
      if (/[a-zA-Z]/.test(result) && convertToLaTeX) {
        // console.log(`result: ${result}`);
        // console.log("converting to LaTeX");
        // // console.log(result.text());
        if (result.toTeX !== undefined) { // result is a nerdamer expression
          result = result.toTeX("decimal"); // export LaTeX as decimals
        } // else then result is string values like "undefined"
        result = result.replace(/asin/g, "arcsin");
        result = result.replace(/acos/g, "arccos");
        result = result.replace(/atan/g, "arctan");
        result = result.replace(/asec/g, "arcsec");
        result = result.replace(/acsc/g, "arccsc");
        result = result.replace(/acot/g, "arccot");
        // console.log(`result: ${result}`);
      }
      result = convertToDecimals(result);
      // console.log(`result: ${result}`);
      currentOutput.innerHTML = ` = ${result}`;
      // console.log(currentOutput.innerHTML);
      // // console.log(output.getAttribute("id"));
      // beautify result display using MathQuill
      if (displayInLaTeX) {
        // mathquillify the output box and store the returned MQ API object in an array
        const outputNumber = getNumber(currentOutput);
        outputMQs[outputNumber] = MQ.StaticMath(currentOutput);
      }
    }
    displayInLaTeX = displayInLaTeXDefault;
    convertToLaTeX = converToLaTexDefault;
  }
}
// listen for keyboard events in the input box and update result display in output box
mathField.addEventListener("keyup", (event) => {
  // if key pressed is ENTER, UP Arrow, DOWN Arrow, return immediately
  if (event.keyCode === 13 || event.keyCode === 38 || event.keyCode === 40) {
    return;
  }
  const currentInput = event.target;
  updateOutput(currentInput, event);
});
// listen for keydown events of ENTER, UP arrow, and DOWN arrow keys to react immediately
mathField.addEventListener("keydown", (event) => {
  const currentInput = event.target;
  const currentInputNumber = getNumber(currentInput);
  if (event.keyCode === 13) { // ENTER key is pressed
    createNewField();
  } else if (event.keyCode === 38) { // UP arrow key is pressed
    event.preventDefault();
    if (inputNumber > 0) {
      const previousInput = getInput(currentInputNumber - 1);
      previousInput.focus();
      moveCaretToEnd(previousInput);
    }
  } else if (event.keyCode === 40) { // DOWN arrow key is pressed
    event.preventDefault();
    if (currentInputNumber < inputNumber - 1) {
      const nextInput = getInput(currentInputNumber + 1);
      nextInput.focus();
      moveCaretToEnd(nextInput);
    } else {
      createNewField();
    }
  } else if (event.keyCode === 8) { // BACKSPACE key is pressed
    // input is empty and is NOT the first input box
    if (currentInput.value === "" && currentInputNumber !== 0) {
      event.preventDefault(); // prevent BACKSPACE from deleting previous inputs
      // remove current input box and associated output box
      currentInput.remove();
      const currentOutput = getOutput(currentInputNumber);
      currentOutput.remove();
      if (currentInputNumber + 1 < inputNumber) {
        const nextInput = getInput(currentInputNumber + 1);
        nextInput.focus();
      } else {
        const previousInput = getInput(currentInputNumber - 1);
        previousInput.focus();
      }
      // reassign id for all subsequent input and output boxes
      for (let i = currentInputNumber + 1; i < inputNumber; i++) {
        const input = getInput(i);
        input.setAttribute("id", `input-${i - 1}`);
        const output = getOutput(i);
        output.setAttribute("id", `output-${i - 1}`);
      }
      // decrement total input number
      inputNumber--;
    }
  }
});

// handle solveEquations command
function handleSolveEquations(expr) {
  const equalsIndex = expr.indexOf("=");
  const doubleEqualsIndex = expr.indexOf("==");
  if (equalsIndex >= 0 && doubleEqualsIndex === -1) { // only matching single equal sign
    // console.log("solveEquations found!");
    let paramList = [];
    const openBraceIndex = expr.indexOf("{");
    if (openBraceIndex >= 0) { // system of equations
      // console.log("system of equations found!");
      const closeBraceIndex = expr.indexOf("}");
      const params = expr.substring(openBraceIndex + 1, closeBraceIndex);
      paramList[0] = params.split(",");
      // console.log(`paramList[0]: ${paramList[0]}` instanceof Array);
    } else { // single equation
      const params = expr;
      paramList = params.split(","); // split into expression and variable to solve for
      if (paramList.length === 1) { // the variable to solve for is not defined
        // pick the first variable parsed by nerdamer automatically
        paramList[1] = nerdamer(params).variables()[0];
      }
    }
    // console.log(`paramList[0]: ${paramList[0]}`);
    // console.log(`paramList[1]: ${paramList[1]}`);
    let result;
    try {
      if (paramList[1] !== undefined) {
        result = nerdamer.solveEquations(paramList[0], paramList[1]);
        evaluateSymbols(result);
        // console.log(`result: ${result}`);
      } else {
        result = nerdamer.solveEquations(paramList[0]);
        evaluateSymbols(result);
        result = formatArrayResults(result);
      }
    } catch (e) { // handle error like attempting to solve non-linear system of equations
      // // console.log("error object: ", e);
      // // console.log("error object as string: " + e.toString());
      result = new Error(e.message);
    }
    displayInLaTeX = false;
    convertToLaTeX = false;
    return result;
  }
  return false;
}

// evaluate all input boxes
// eslint-disable-next-line no-unused-vars
function evaluateAll() {
  for (let i = 0; i < inputNumber; i++) {
    const input = document.getElementById(composeId("input", i));
    updateOutput(input);
  }
}

function getValue(input) {
  const guppy = getGuppy(input);
  const text = guppy.engine.get_content("text");
  return importFromText(text);
}

function getGuppy(input) {
  return guppies[getNumber(input)];
}

function importFromText(text) {
  console.log("​importFromText -> text", text);
  let expr = text;
  const funcNameMap = {
    neg: "-",
    absolutevalue: "abs",
    squareroot: "sqrt",
    root: undefined,
    derivative: "diff",
    integral: "integrate",
  };
  Object.keys(funcNameMap).forEach((textFuncName) => {
    const regex = new RegExp(`${textFuncName}\\((.+)\\)`, "g");
    console.log(expr.match(regex));
    const newFuncName = funcNameMap[textFuncName];
    let replace;
    // eslint-disable-next-line default-case
    switch (textFuncName) {
      case "neg":
      case "absolutevalue":
      case "squareroot":
      case "derivative":
      case "integral":
        // eslint-disable-next-line prefer-template
        replace = newFuncName + "($1)";
        break;
      case "root":
        replace = rootReplacer;
        break;
      }
      expr = iterativeReplace(expr, regex, replace);
			console.log("​importFromText -> expr", expr);
  });
  console.log("​importFromText -> expr", expr);
  return expr;
}

function rootReplacer(str, args) {
  const argList = args.replace(/\s/g, "").split(",");
  const base = argList[1];
  const power = `(1/${argList[0]})`;
  return `(${base}^${power})`;
}

function iterativeReplace(expr, regex, replacer) {
  let newExpr = expr;
  let oldExpr = "";
  if (oldExpr === newExpr) {
    // a random default value that is different from expr
    oldExpr = "?";
  }
  while (oldExpr !== newExpr) {
    oldExpr = newExpr;
    newExpr = newExpr.replace(regex, replacer);
  }
  return newExpr;
}

// create a new input box
function createNewInput() {
  const newInput = document.createElement("div");
  newInput.setAttribute("type", "text");
  newInput.setAttribute("size", "30");
  newInput.setAttribute("spellcheck", false);
  newInput.setAttribute("class", "input");
  newInput.setAttribute("id", composeId("input", inputNumber));
  return newInput;
}
// create a new output box
function createNewOutput() {
  const newOutput = document.createElement("span");
  newOutput.setAttribute("class", "output");
  newOutput.setAttribute("id", composeId("output", inputNumber));
  return newOutput;
}
/**
 * Return the sequence number of an input or output box
 */
function getNumber(element) {
  return Number(element.id.substring(element.id.lastIndexOf("-") + 1));
}

function getOutput(index) {
  return document.getElementById(composeId("output", index));
}

function getInput(index) {
  return document.getElementById(composeId("input", index));
}

/**
 *
 * @param {String} type "output"/"input"
 * @param {Number|String} number the sequence number
 */
function composeId(type, number) {
  return `${type}-${number}`;
}

// create a new field with an input box and output box
function createNewField() {
  const newInput = createNewInput();
  const newOutput = createNewOutput();
  mathField.appendChild(newInput);
  mathField.appendChild(newOutput);
  guppies[inputNumber] = new Guppy(newInput.id);
  inputNumber++;
}
// move caret to the end of input string
function moveCaretToEnd(input) {
  input.setSelectionRange(input.value.length, input.value.length);
}

// Error class for reporting calculation errors
class Error {
  constructor(message) {
    this.message = message;
  }
}

function removeDuplicatedResults(result) {
  // console.log("removing duplicated results");
  if (result instanceof Array) {
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      for (let j = 0; j < i; j++) {
        if (element.valueOf() === result[j].valueOf()) {
          result.splice(i, 1);
          i--;
        }
      }
    }
  }
}

function removeImagineryElements(symbol, result, index) {
  // console.log("symbol: ", symbol);
  const elements = symbol.elements;
  if (elements !== undefined) {
    // remove imaginery results
    // console.log(`elements: ${elements}`);
    // console.log(`elements.length: ${elements.length}`);
    for (let i = 0; i < elements.length; i++) {
      // console.log(`element.value: ${elements[i].value}`);
      if (elements[i] !== undefined && elements[i].value.indexOf("i") >= 0) {
        // console.log(`imaginery element ${elements[i]}`);
        elements.splice(i, 1);
        i--;
      }
    }
  } else if (symbol.value !== undefined) {
    if (symbol.value.indexOf === undefined) { // values like Infinity
      // do nothing
    } else if (symbol.value.indexOf("i") >= 0) {
      // console.log("i found!");
      if (result instanceof Array) { // prevent deleting result containing function names like "sin"
        // console.log("result is trimmed!");
        result.splice(index, 1);
        return true;
      }
    }
  }
  return false;
}

function removeImagineryResults(result) {
  if (result instanceof Array) { // result is an array of Symbols
    for (let i = 0; i < result.length; i++) {
      // console.log(`i: ${i}`);
      // console.log(`result: ${result}`);
      const elementDeleted = removeImagineryElements(result[i], result, i);
      if (elementDeleted) {
        i--;
      }
    }
  } else if (result.symbol !== undefined) {
    // result is an Expression object with Symbol object embedded
    removeImagineryElements(result.symbol, result);
  }
}

function evaluateSymbols(array) {
  // console.log(`result.length: ${array.length}`);
  for (let i = 0; i < array.length; i++) {
    array[i] = nerdamer(array[i]).evaluate().symbol;
    // console.log(`resul[${i}]: ${array[i]}`);
  }
  // console.log("results: ", array);
}

function formatArrayResults(result) {
  let displayed = "{";
  for (let i = 0; i < result.length; i++) {
    displayed += `${result[i][0]} = ${result[i][1]}`;
    if (i < result.length - 1) {
      displayed += ",";
    }
  }
  displayed += "}";
  // console.log(`displayed: ${displayed}`);
  return displayed;
}

function convertToDecimals(result) {
  if (result instanceof Array) { // an array result
    // console.log("converting an array result to decimals");
    for (let i = 0; i < result.length; i++) {
      if (result[i] instanceof Array) {
        for (let j = 0; j < result[i].length; j++) {
          result[i][j] = nerdamer(result[i][j], undefined, "numer").text("decimals");
        }
      } else {
        result[i] = nerdamer(result[i], undefined, "numer").text("decimals");
      }
    }
    return result;
  }
  if (typeof result === "object" && "text" in result) { // an expression result
    return result.text("decimals");
  } // a string result
  // console.log("converting a string result to decimals");
  return result;
}

// Source: https://stackoverflow.com/a/41391872/6798201
// Wrap wrapper around nodes
// Just pass a collection of nodes, and a wrapper element
function wrapAll(nodes, wrapper) {
  // Cache the current parent and previous sibling of the first node.
  const parent = nodes[0].parentNode;
  const previousSibling = nodes[0].previousSibling;

  // Place each node in wrapper.
  //  - If nodes is an array, we must increment the index we grab from
  //    after each loop.
  //  - If nodes is a NodeList, each node is automatically removed from
  //    the NodeList when it is removed from its parent with appendChild.
  for (let i = 0; nodes.length - i; wrapper.firstChild === nodes[0] && i++) {
    wrapper.appendChild(nodes[i]);
  }

  // Place the wrapper just after the cached previousSibling,
  // or if that is null, just before the first child.
  const nextSibling = previousSibling ? previousSibling.nextSibling : parent.firstChild;
  parent.insertBefore(wrapper, nextSibling);

  return wrapper;
}

// Unwrap a wrapper by replacing it with its child nodes
function unwrap(wrapper) {
  // // console.log("​unwrap -> wrapper.parent", wrapper.parentNode);
  while (wrapper.childElementCount > 0) {
    // // console.log("​unwrap -> wrapper.childElementCount", wrapper.childElementCount);
    // // console.log("​unwrap -> wrapper", wrapper);
    // // console.log("​unwrap -> wrapper.childNodes[i]", wrapper.firstChild);
    wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
  }
  wrapper.remove();
}

/**
 * Based on: https://techoverflow.net/2018/03/30/copying-strings-to-the-clipboard-using-pure-javascript/
 * Select a string, if user click copy (like on mobile devices) or
 * press keyboard to copy (like ctrl-c for windows), set the clipboard content
 * to the given string
 * @param {String} str the string to select
 */
function selectString(str) {
  let el = document.getElementById("copyBoard");
  if (!el) {
    // Create new element
    el = document.createElement('textarea');
    el.id = "copyBoard";
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute('readonly', '');
    el.style.cssText = "position: absolute; left: -9999px";
    document.body.appendChild(el);
  }
  // Set value (string to be copied)
  el.value = str;
  // Select text inside element
  el.select();
  return el;
}

/**
 * Based on: https://techoverflow.net/2018/03/30/copying-strings-to-the-clipboard-using-pure-javascript/
 * Copying strings to the clipboard using pure Javascript
 * @param {String} str the string to copy to clipboard
 */
function copyStringToClipboard(str) {
  const el = selectString(str);
  // Copy text to clipboard
  document.execCommand('copy');
  // Remove temporary element
  el.remove();
}

// check if an element is hovered
function isHovered(element) {
  return element.matches(":hover");
}

// Unused functions

// eslint-disable-next-line no-unused-vars
function deleteVars() {
  const vars = nerdamer.getVars();
  const tempVars = {};
  Object.keys(vars).forEach((varName) => {
    // console.log(`var: ${varName}`);
    tempVars[varName] = vars[varName];
  });
  nerdamer.clearVars();
  return tempVars;
}

// find matching parenthesis within a given string from the start index
// eslint-disable-next-line no-unused-vars
function findMatchingParen(string, start) {
  const stack = [];
  for (let i = start; i < string.length; i++) {
    const current = string.charAt(i);
    if (current === "(") {
      stack.push(1);
    } else if (current === ")") {
      stack.pop();
    }
    if (stack.length === 0) {
      return i;
    }
  }
  return -1;
}