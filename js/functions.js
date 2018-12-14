// Add degrees/radians options for trig functions
let isDegrees = true; // default to radians
let trigs = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot'];
let inverseTrigs = ['asin', 'acos', 'atan', 'acsc', 'asec', 'acot'];
for (let trig of trigs){
  nerdamer.replaceFunction(trig, function(f, core) {
    return function(x) {
      if (isDegrees) {
        return f(degSymbolToRadSymbol(x, core));
      }
      return f(x);
    };
  });
}
for (let trig of inverseTrigs){
  nerdamer.replaceFunction(trig, function(f, core) {
    return function(x) {
      if (isDegrees) {
        return radSymbolToDegSymbol(f(x), core);
      }
      return f(x);
    };
  });
}
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
