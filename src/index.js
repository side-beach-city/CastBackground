let w = window.open("./src/control.html", "control", "width=490, height=300");

window.onbeforeunload  = (e) => {
  window.unloading = true;
  if(w){
    w.close();
  }
}