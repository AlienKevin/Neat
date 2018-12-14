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
  btn.onclick = function(event) {
    modal.style.display = "block";
  }

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}
// setting window
const settingWindow = document.querySelector("#settingWindow");
const saveSettingBtn = settingWindow.querySelector("button#saveSettingBtn");
saveSettingBtn.addEventListener("click", function(){
  let inputs = settingWindow.querySelectorAll("div.modal-body input");
  for (let input of inputs){
    switch (input.name){
      case "decimalPrecision":
        setPrecision(Number(input.value));
        break;
    }
  }
});
let setPrecision = function(value){
  if (value >= 0 && value <= MAX_PRECISION){
    precision = value;
    showPopupMessage("Settings saved!");
  } else{
    showPopupMessage("precision value is out of range, should be from 0 to " + MAX_PRECISION);
  }
}
let showPopupMessage = function(message){
  window.alert(message);
}
