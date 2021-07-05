let w = window.open("./src/control.html", "control", "width=490, height=300");

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