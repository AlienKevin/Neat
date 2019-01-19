{ // restrict all variables and functions
  // popup windows
  const popupIds = ["createFormulaWindow", "settingWindow"];
  // buttons for triggering popup windows
  const popupBtnIds = ["createFormulaBtn", "settingBtn"];
  const settingWindow = document.querySelector("#settingWindow");

  for (let i = 0; i < popupIds.length; i++) {
    const popupId = popupIds[i];
    const popupBtnId = popupBtnIds[i];
    // Get the modal
    const modal = document.getElementById(popupId);

    // Get the button that opens the modal
    const btn = document.getElementById(popupBtnId);

    // Get the <span> element that closes the modal
    const span = modal.querySelector(".close");

    // When the user clicks the button, open the modal
    btn.onclick = () => {
      modal.style.display = "block";
    };

    // When the user clicks on <span> (x), close the modal
    // eslint-disable-next-line no-loop-func
    span.onclick = function () {
      // reset the values in the inputs because changes not saved
      console.log("resetting inputs to default values in popup windows!");
      resetDefaults(popupId);
      closeWindow(modal);
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target === modal) {
        closeWindow(modal);
      }
    };
  }

  function resetDefaults(popupId) {
    switch (popupId) {
      case "createFormulaWindow":
        resetDefaultFormulas();
        break;
      case "settingWindow":
        console.log("settingWindow found!");
        resetDefaultSettings();
        break;
      default:
        throw new Error(`popupId ${popupId} is not valid`);
    }
  }
  
  function resetDefaultSettings() {
    // display the default precision
    const precisionInput = settingWindow.querySelector("input[name=decimalPrecision]");
    precisionInput.value = precision;
    // select the default copy on double click option
    if (copyOnDoubleClick) {
      settingWindow.querySelector("input#copyOnDblClickYes").checked = true;
    } else {
      settingWindow.querySelector("input#copyOnDblClickNo").checked = true;
    }
    // load stored constants
    clearConstantTable();
    for (let i = 0; i < constants.length; i++) {
      constantTable.rows[i].cells[NAME] = constants[i][NAME];
      constantTable.rows[i].cells[VALUE] = constants[i][VALUE];
    }
  }

  function resetDefaultFormulas() {
    // need implementation
  }

  /** *****************************Start of Setting Window**************************** */
  const constants = [];
  const NAME = 0;
  const VALUE = 1;
  const constantTable = settingWindow.querySelector("div#setConstants table");

  function clearConstantTable() {
    for (let i = 1; i < constantTable.rows.length; i++) { // skip the first th
      constantTable.rows[i][NAME] = "";
      constantTable.rows[i][VALUE] = "";
    }
  }

  function setConstant(name, value) {
    // console.log("​setConstant -> name", name);
    // console.log("​setConstant -> value", value);
    try {
      nerdamer.setConstant(name, value);
    } catch (e) {
      // console.log("​}catch -> e", e);
      return false; // invalid inputs
    }
    console.log("constant is valid!");
    return true; // valid inputs
  }

  function setConstants() {
    let isValid = true;
    for (let i = 1; i < constantTable.rows.length; i++) { // skip the first th
      const row = constantTable.rows[i];
      // console.log("​setConstants -> row", row);
      const name = row.cells[NAME].firstElementChild.value;
      // console.log("​setConstants -> row.cells[0]", row.cells[0]);
      // console.log("​setConstants -> name", name);
      const value = Number(row.cells[VALUE].firstElementChild.value);
      // console.log("​setConstants -> row.cells[1]", row.cells[1]);
      // console.log("​setConstants -> value", value);
      const isCurrentValid = setConstant(name, value);
      if (!isCurrentValid) {
        isValid = false;
        showMessage("name must be alphabetical", row.cells[NAME]);
        showMessage("value must be numbers", row.cells[VALUE]);
      } else {
        // store the new constant
        constants.push([name, value]);
      }
    }
    return isValid;
  }

  function setCopyOnDblClick(input) {
    if (input.checked) {
      if (input.value === "yes") {
        copyOnDoubleClick = true;
      } else {
        copyOnDoubleClick = false;
      }
    }
    return true; // all selections are valid
  }
  function setPrecision(newPrecision, input) {
    let value = newPrecision;
    if (value === "") {
      showMessage("Please input a number", input);
    } else {
      value = Number(value);
      if (Number.isFinite(value) && Number.isInteger(value)) { // input is a number
        // console.log("value: " + value);
        if (value >= 0 && value <= MAX_PRECISION) {
          precision = value;
          return true; // value is valid
        }
        showMessage(`Precision value is out of range, should be from 0 to ${MAX_PRECISION}`, input);
      } else {
        showMessage("Input should be a valid integer", input);
      }
    }
    return false; // invalid value
  }

  // initialize default values for settings
  resetDefaultSettings();

  const saveSettingBtn = settingWindow.querySelector("button#saveSettingBtn");
  saveSettingBtn.addEventListener("click", () => {
    const inputs = settingWindow.querySelectorAll("div.modal-body input");
    let isValid = true;
    inputs.forEach((input) => {
      console.log("​input", input);
      switch (input.name) {
        case "decimalPrecision":
          isValid = setPrecision(input.value, input) && isValid;
          break;
        case "copyOnDblClick":
          isValid = setCopyOnDblClick(input) && isValid;
          break;
        default:
          if (input.name.startsWith("constantName")
          || input.name.startsWith("constantValue")) {
            // constant setting inputs
          } else {
            throw new Error(`Invalid input name of ${input.name}`);
          }
      }
    });
    isValid = setConstants() && isValid;
    // console.log("​isValid", isValid);
    if (isValid) {
      showMessage("Settings saved!", saveSettingBtn);
      window.setTimeout(() => {
        removeOldMessage();
        closeWindow(settingWindow);
      }, 500);
      // re-render all equations
      evaluateAll();
    }
  });
  /** *****************************End of Setting Window**************************** */

  function removeOldMessage() {
    const oldMsg = document.querySelector("div.modal span.message");
    if (oldMsg !== null) {
      oldMsg.remove(); // remove old message
    }
  }

  function showMessage(message, place) {
    removeOldMessage();
    const msg = document.createElement("span");
    msg.style.paddingLeft = "10px";
    msg.className = "message";
    msg.innerHTML = message;
    place.parentNode.insertBefore(msg, place.nextSibling);
  }

  function closeWindow(modal) { // hide the popup window
    modal.style.display = "none";
  }
}
