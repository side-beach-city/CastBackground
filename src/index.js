let w = null;

window.onbeforeunload  = (e) => {
  if(w && !w.x_debugmode){
    e.preventDefault();
    e.returnValue = "check";
    w.x_ownerunload = true;
  }
}

window.onunload = (e) => {
  if(w){
    w.close();
  }
}

document.getElementById("startup_button").addEventListener("click", (e) => {
  w = window.open("./src/control.html", "control", "width=490, height=300");
  document.getElementById("startup_button").style.display = "none";
});