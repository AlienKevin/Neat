// popup windows
let popupIds = ["createFormulaWindow", "settingWindow"];
let popupBtnIds = ["createFormulaBtn", "settingBtn"];
for (let i = 0; i < popupIds.length; i++) {
  // Get the modal
  const modal = document.getElementById(popupIds[i]);

  // Get the button that opens the modal
  const btn = document.getElementById(popupBtnIds[i]);

  // Get the <span> element that closes the modal
  const span = modal.querySelector(".close");

  // When the user clicks the button, open the modal
  btn.onclick = function (event) {
    modal.style.display = "block";
  }

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    closeWindow(modal);
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      closeWindow(modal);
    }
  }
}
let closeWindow = function (modal) { // hide the popup window
  modal.style.display = "none";
}
// setting window
const settingWindow = document.querySelector("#settingWindow");

// initialize default values for settings
// display the default precision
const precisionInput = settingWindow.querySelector("input[name=decimalPrecision]");
precisionInput.value = precision;
// select the default copy on double click option
if (copyOnDoubleClick) {
  settingWindow.querySelector("input#copyOnDblClickYes").checked = true;
} else {
  settingWindow.querySelector("input#copyOnDblClickNo").checked = true;
}

const saveSettingBtn = settingWindow.querySelector("button#saveSettingBtn");
saveSettingBtn.addEventListener("click", function () {
  let inputs = settingWindow.querySelectorAll("div.modal-body input");
  let isValid = true;
  for (let input of inputs) {
    switch (input.name) {
      case "decimalPrecision":
        isValid = setPrecision(input.value, input) && isValid;
        break;
      case "copyOnDblClick":
        isValid = setCopyOnDblClick(input) && isValid;
        break;
    }
  }
  if (isValid) {
    showMessage("Settings saved!", saveSettingBtn);
    window.setTimeout(function () {
      removeOldMessage();
      closeWindow(settingWindow);
    }, 500);
    // re-render all equations
    evaluateAll();
  }
});
let setCopyOnDblClick = function (input) {
  if (input.checked) {
    if (input.value === "yes") {
      copyOnDoubleClick = true;
    } else {
      copyOnDoubleClick = false;
    }
  }
  return true; // all selections are valid
}
let setPrecision = function (value, input) {
  if (value === "") {
    showMessage("Please input a number", input);
  } else {
    value = Number(value);
    if (Number.isFinite(value) && Number.isInteger(value)) { // input is a number
      // console.log("value: " + value);
      if (value >= 0 && value <= MAX_PRECISION) {
        precision = value;
        return true; // value is valid
      } else {
        showMessage("Precision value is out of range, should be from 0 to " + MAX_PRECISION, input);
      }
    } else {
      showMessage("Input should be a valid integer", input);
    }
  }
  return false; // invalid value
}
let showMessage = function (message, place) {
  removeOldMessage();
  let msg = document.createElement("span");
  msg.style.paddingLeft = "10px";
  msg.className = "message";
  msg.innerHTML = message;
  place.parentNode.insertBefore(msg, place.nextSibling);
}

let removeOldMessage = function () {
  let oldMsg = document.querySelector("div.modal span.message");
  if (oldMsg !== null) {
    oldMsg.remove(); // remove old message
  }
}