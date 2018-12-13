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
  let smallRad = rad % (2 * pi);
  switch (smallRad){
    case 0:
      return 0;
    case pi / 6:
      return 30;
    case pi / 4:
      return 45;
    case pi / 3:
      return 60;
    case pi / 2:
      return 90;
    case 2 * pi / 3:
      return 120;
    case 3 * pi / 4:
      return 135;
    case 5 * pi / 6:
      return 150;
    case pi:
      return 180;
    case 7 * pi / 6:
      return 210;
    case 5 * pi / 4:
      return 225;
    case 4 * pi / 3:
      return 240;
    case 3 * pi / 2:
      return 270;
    case 5 * pi / 3:
      return 300;
    case 7 * pi / 4:
      return 315;
    case 11 * pi / 6:
      return 330;
    default:
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
