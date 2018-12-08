//initialize MathQuill
const MQ = MathQuill.getInterface(2);
//retrieve mathField which contains all input and output boxes
const mathField = document.querySelector("#mathField");
// the enumerated number sequence of input, used to generate ids for input boxes
let inputNumber = 0; // 0 means the first input (zero-based index)
//create initial input and output on page load
document.addEventListener("DOMContentLoaded", function(event) {
  createNewField();
})
//listen for keyboard events in the input box and update result display in output box
mathField.addEventListener("keyup", function(event) {
  //if key pressed is ENTER, UP Arrow, or DOWN Arrow, return immediately
  if (event.keyCode == 13 || event.keyCode == 38 || event.keyCode == 40) {
    return;
  }
  const currentInput = event.target;
  const inputId = currentInput.getAttribute("id");
  const currentInputNumber = Number(inputId.substring(inputId.length - 1)); //retrieve the last character
  if (mathField.querySelector("span#output-" + currentInputNumber) !== null) {
    let result = evalExpr(currentInput);
    const output = mathField.querySelectorAll("span.output")[currentInputNumber];
    if (/[a-zA-Z]/.test(result)){
      result = nerdamer.convertToLaTeX(result);
    }
    output.innerHTML = " = " + result;
    // console.log(output);
    // console.log(output.getAttribute("id"));
    // beautify result display using MathQuill
    MQ.StaticMath(output);
  }
});
//listen for keydown events of ENTER, UP arrow, and DOWN arrow keys to react immediately
mathField.addEventListener("keydown", function(event) {
  const currentInput = event.target;
  const inputId = currentInput.getAttribute("id");
  const currentInputNumber = Number(inputId.substring(inputId.length - 1)); //retrieve the last character
  if (event.keyCode == 13) { //ENTER key is pressed
    createNewField();
  } else if (event.keyCode == 38) { //UP arrow key is pressed
    event.preventDefault();
    if (inputNumber > 0) {
      let previousInput = mathField.querySelector("#input-" + (currentInputNumber - 1));
      previousInput.focus();
      moveCaretToEnd(previousInput);
    }
  } else if (event.keyCode == 40) { //DOWN arrow key is pressed
    event.preventDefault();
    if (currentInputNumber < inputNumber - 1) {
      let nextInput = mathField.querySelector("#input-" + (currentInputNumber + 1));
      nextInput.focus();
      moveCaretToEnd(nextInput);
    } else {
      createNewField();
    }
  }
});
//create a new input box
let createNewInput = function() {
  const newInput = document.createElement("input");
  newInput.setAttribute("type", "text");
  newInput.setAttribute("size", "30");
  newInput.setAttribute("spellcheck", false);
  newInput.setAttribute("class", "input");
  newInput.setAttribute("id", "input-" + inputNumber);
  return newInput;
}
//create a new output box
let createNewOutput = function() {
  const newOutput = document.createElement("span");
  newOutput.setAttribute("class", "output");
  newOutput.setAttribute("id", "output-" + inputNumber);
  return newOutput;
}
//create a new field with an input box and output box
let createNewField = function() {
  const newInput = createNewInput();
  const newOutput = createNewOutput();
  mathField.appendChild(newInput);
  mathField.appendChild(newOutput);
  newInput.focus();
  inputNumber++;
}
//move caret to the end of input string
let moveCaretToEnd = function(input) {
  input.setSelectionRange(input.value.length, input.value.length);
}
//evaluate expression inside an input box
let evalExpr = function(input) {
  const expr = input.value;
  console.log("expr: " + expr);
  let result;
  if ((result = handleSolveEquations(expr)) === false) {
    // let result = nerdamer.convertToLaTeX(nerdamer(expr).evaluate().text()).toString();
    // let result = nerdamer(expr).evaluate().text("decimal").toString();
    // let result = nerdamer(expr).evaluate().toTeX("decimal");
    result = nerdamer(expr, undefined, ["numer"]);
    // if (result == ""){
    //     result = nerdamer(expr).evaluate().toString();
    // }
  }
  removeImagineryResults(result);
  // convert fractions in result to decimals
  result = result.text("decimal");
  // separate long result outputs into multiple lines
  if (result.length > 30) {
    result = result.replace(/,/g, ",<br>");
  }
  console.log("result: " + result);
  return result;
}
let removeImagineryResults = function(result){
  if (result.symbol !== undefined) {
    let symbol = result.symbol;
    console.log("symbol: " + symbol);
    let elements = symbol.elements;
    if (elements !== undefined) {
      //remove imaginery results
      console.log("elements: " + elements);
      console.log("elements.length: " + elements.length);
      for (let i = 0; i < elements.length; i++) {
        console.log("element.value: " + elements[i].value);
        if (elements[i] !== undefined && elements[i].value.indexOf("i") >= 0) {
          console.log("imaginery element " + elements[i]);
          elements.splice(i, 1);
          i--;
        }
      }
    }
  }
}
//handle solveEquations command
let handleSolveEquations = function(expr) {
  const keywordIndex = expr.indexOf("solveEquations");
  if (keywordIndex >= 0) {
    console.log("solveEquations found!");
    const paramStart = keywordIndex + "solveEquations".length;
    const parenOpen = expr.indexOf("(", paramStart);
    console.log("parenOpen: " + parenOpen);
    const parenClose = findMatchingParen(expr, parenOpen);
    console.log("parenClose: " + parenClose);
    const params = expr.substring(parenOpen + 1, parenClose);
    console.log("params: " + params);
    const paramList = params.split(",");
    let result = nerdamer.solveEquations(paramList[0], paramList[1]);
    for (let i = 0; i < result.length; i++) {
      console.log("i=", i);
      result[i] = nerdamer(result[i], undefined, "numer").text("decimals");
    }
    return result;
  } else {
    return false;
  }
}
//find matching parenthesis within a given string from the start index
let findMatchingParen = function(string, start) {
  let stack = [];
  for (let i = start; i < string.length; i++) {
    let current = string.charAt(i);
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
