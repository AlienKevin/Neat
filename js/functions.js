// Add degrees/radians options for trig functions
let isDegrees = false; // default to radians
nerdamer.replaceFunction('sin', function(sin, core) {
  return function(x) {
    if (isDegrees) {

    }
    return sin(x);
  };
});
let radToDeg = function(rad) {
  // when rad begins to be >= 683565291, result is no longer precise
  let pi = Math.PI;
  if (evenlyDivide(rad, 2 * pi)) {
    return 0;
  } else if (evenlyDivide(rad, pi)) {
    return 180;
  } else if (evenlyDivide(rad - pi / 2, 2 * pi)){
    return 90;
  } else if (evenlyDivide(rad + pi / 2, 2 * pi)){
    return 270;
  } else if (evenlyDivide(rad - pi / 4, 2 * pi)){
    return 45;
  } else if (evenlyDivide(rad + pi / 4, 2 * pi)){
    return 315;
  } else if (evenlyDivide(rad - pi / 6, 2 * pi)){
    return 30;
  } else if (evenlyDivide(rad + pi / 6, 2 * pi)){
    return 330;
  } else if (evenlyDivide(rad - pi / 3, 2 * pi)){
    return 60;
  } else if (evenlyDivide(rad + pi / 3, 2 * pi)){
    return 300;
  } else if (evenlyDivide(rad - 2 * pi / 3, 2 * pi)){
    return 120;
  } else if (evenlyDivide(rad + 2 * pi / 3, 2 * pi)){
    return 240;
  } else if (evenlyDivide(rad - 3 * pi / 4, 2 * pi)){
    return 135;
  } else if (evenlyDivide(rad + 3 * pi / 4, 2 * pi)){
    return 225;
  } else if (evenlyDivide(rad - 5 * pi / 6, 2 * pi)){
    return 150;
  } else if (evenlyDivide(rad + 5 * pi / 6, 2 * pi)){
    return 210;
  } else{
    let smallRad = rad % (2 * pi);
    return smallRad / (pi) * 180;
  }
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
