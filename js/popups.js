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
  btn.onclick = function() {
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
