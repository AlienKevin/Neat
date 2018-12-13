// Add degrees/radians options for trig functions
let isDegrees = true; // default to radians
nerdamer.replaceFunction('sin', function(sin, core) {
  return function(x) {
    if (isDegrees) {
      return sin(degSymbolToRadSymbol(x, core));
    }
    return sin(x);
  };
});
let radToDeg = function(rad) {
  let pi = Math.PI;
  let smallRad = rad % (2 * pi);
  let deg = smallRad / (pi) * 180;
  let errorBound = 1e-6;
  // adjust floating point imprecisions
  if (Math.abs(deg - Math.round(deg)) <= errorBound){
    return Math.round(deg);
  } else{
    return deg;
  }
}
let radSymbolToDegSymbol = function(radSymbol, core){
  let rad = radSymbol.valueOf();
  let deg = radToDeg(rad);
  return new core.Symbol(deg);
}
let degToRad = function(deg){
  let pi = Math.PI;
  return deg / 180 * pi;
}
let degSymbolToRadSymbol = function(degSymbol, core){
  let deg = degSymbol.valueOf();
  let rad = degToRad(deg);
  return new core.Symbol(rad);
}
let testRadToDeg = function(rad){
  for (let i = 0; i < 1e9; i++){
    let deg = radToDeg(i * Math.PI);
    if (i % 2 == 0){ // even
      if (deg !== 0){
        console.log("radToDeg breaks at: " + i);
      }
    } else{ // odd
      if (deg !== 180){
        console.log("radToDeg breaks at: " + i);
      }
    }
  }
  console.log("radToDeg successfully passed the test!");
}
let evenlyDivide = function(val, step) {
  let divided = val / step;
  let errorBound = 1e-7;
  if (Math.abs(divided - Math.round(divided)) < errorBound) {
    return true;
  }
  return false;
}
// test functions for evenlyDivide
let testEvenlyDivide = function() {
  for (let i = 1; i < 300; i++) {
    for (let j = 1; j < 10; j++) {
      let num = j * Math.pow(10, i);
      if (!evenlyDivide(num * Math.PI, Math.PI)) {
        console.log("evenly divide breaks at: " + num);
      }
    }
  }
}
// source: https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript
// function floatSafeRemainder(val, step){
//     var valDecCount = (val.toString().split('.')[1] || '').length;
//     var stepDecCount = (step.toString().split('.')[1] || '').length;
//     var decCount = valDecCount > stepDecCount? valDecCount : stepDecCount;
//     var valInt = parseInt(val.toFixed(decCount).replace('.',''));
//     var stepInt = parseInt(step.toFixed(decCount).replace('.',''));
//     return (valInt % stepInt) / Math.pow(10, decCount);
//   }
