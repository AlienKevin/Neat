{ // restrict all variables and functions
  // Add degrees/radians options for trig functions
  const degRadToggle = document.querySelector("div#degRadToggle");
  let isDegrees = false; // default to radians
  const trigs = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot'];
  const inverseTrigs = ['asin', 'acos', 'atan', 'acsc', 'asec', 'acot'];
  function switchToggle() {
    const cover = degRadToggle.querySelector(".toggle-cover");
    if (cover.getAttribute("class").indexOf("toggle-cover-right") >= 0) { // in radians, change to degrees
      cover.setAttribute("class", "toggle-cover toggle-cover-left");
    } else { // in degrees, change to radians
      cover.setAttribute("class", "toggle-cover toggle-cover-right");
    }
    isDegrees = !isDegrees; // flip the isDegrees setting
  }
  // register listener for degrees/radians toggle button
  degRadToggle.addEventListener("click", () => {
    switchToggle();
    // eslint-disable-next-line no-undef
    evaluateAll();
  });

  // trig functions
  trigs.forEach((trig) => {
    nerdamer.replaceFunction(trig, (f, core) => function (x) {
        if (isDegrees) {
          return f(degSymbolToRadSymbol(x, core));
        }
        return f(x);
      });
  });
  // inverse-trig functions
  inverseTrigs.forEach((trig) => {
    nerdamer.replaceFunction(trig, (f, core) => function (x) {
        if (isDegrees) {
          return radSymbolToDegSymbol(f(x), core);
        }
        return f(x);
      });
  });

  function radToDeg(rad) {
    const pi = Math.PI;
    const smallRad = rad % (2 * pi);
    const deg = smallRad / (pi) * 180;
    const errorBound = 1e-6;
    // adjust floating point imprecisions
    if (Math.abs(deg - Math.round(deg)) <= errorBound) {
      return Math.round(deg);
    }
      return deg;
  }
  function radSymbolToDegSymbol(radSymbol, core) {
    const rad = radSymbol.valueOf();
    const deg = radToDeg(rad);
    return new core.Symbol(deg);
  }
  function degToRad(deg) {
    const pi = Math.PI;
    return deg / 180 * pi;
  }
  function degSymbolToRadSymbol(degSymbol, core) {
    const deg = degSymbol.valueOf();
    const rad = degToRad(deg);
    return new core.Symbol(rad);
  }
  // eslint-disable-next-line no-unused-vars
  function testRadToDeg() {
    for (let i = 0; i < 1e9; i++) {
      const deg = radToDeg(i * Math.PI);
      if (i % 2 === 0) { // even
        if (deg !== 0) {
          console.log(`radToDeg breaks at: ${i}`);
        }
      } else if (deg !== 180) {
          console.log(`radToDeg breaks at: ${i}`);
        }
    }
    console.log("radToDeg successfully passed the test!");
  }
}
