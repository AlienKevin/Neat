const MQ = MathQuill.getInterface(2);
const mathField = document.querySelector("#mathField");
let inputNumber = 0;
//create initial input and output on page load
document.addEventListener("DOMContentLoaded", function(event){
    createNewField();
})
//listen for keyboard events in the input box
mathField.addEventListener("keyup", function(event){
    //if key pressed is ENTER, UP Arrow, or DOWN Arrow, return immediately
    if (event.keyCode == 13 || event.keyCode == 38 || event.keyCode == 40){
        return;
    }
    const currentInput = event.target;
    const inputId = currentInput.getAttribute("id");
    const currentInputNumber = Number(inputId.substring(inputId.length-1));//retrieve the last character
    if (mathField.querySelector("span#output-" + currentInputNumber) !== null){
        const result = evalExpr(currentInput);
        const output = mathField.querySelectorAll("span.output")[currentInputNumber];
        console.log("result " + result);
        output.innerHTML = " = " + result;
        // console.log(output);
        // console.log(output.getAttribute("id"));
        MQ.StaticMath(output);
    }
});
mathField.addEventListener("keydown", function(event) {
  const currentInput = event.target;
  const inputId = currentInput.getAttribute("id");
  const currentInputNumber = Number(inputId.substring(inputId.length-1));//retrieve the last character
  if (event.keyCode == 13) { //ENTER key is pressed
    createNewField();
} else if(event.keyCode == 38){//UP arrow key is pressed
    event.preventDefault();
    if (inputNumber > 0){
        let previousInput = mathField.querySelector("#input-" + (currentInputNumber - 1));
        previousInput.focus();
        moveCaretToEnd(previousInput);
    }
} else if(event.keyCode == 40){//DOWN arrow key is pressed
    event.preventDefault();
    if (currentInputNumber < inputNumber - 1){
        let nextInput = mathField.querySelector("#input-" + (currentInputNumber + 1));
        nextInput.focus();
        moveCaretToEnd(nextInput);
    } else{
        createNewField();
    }
}
});
let createNewInput = function(){
    const newInput = document.createElement("input");
    newInput.setAttribute("type", "text");
    newInput.setAttribute("size", "30");
    newInput.setAttribute("spellcheck", false);
    newInput.setAttribute("class", "input");
    newInput.setAttribute("id", "input-" + inputNumber);
    return newInput;
}
let createNewOutput = function(){
    const newOutput = document.createElement("span");
    newOutput.setAttribute("class", "output");
    newOutput.setAttribute("id", "output-" + inputNumber);
    return newOutput;
}
let createNewField = function(){
    const newInput = createNewInput();
    const newOutput = createNewOutput();
    mathField.appendChild(newInput);
    mathField.appendChild(newOutput);
    newInput.focus();
    inputNumber++;
}
let moveCaretToEnd = function(input){
    input.setSelectionRange(input.value.length, input.value.length);
}
let evalExpr = function(input) {
  const expr = input.value;
  console.log("expr: " + expr);
  const result = nerdamer.convertToLaTeX(nerdamer(expr).evaluate().toString()).toString();
  return result;
}
