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

/* マウスポインタ強調 */
document.getElementById("display").addEventListener("mousemove", (e) => {
  const p = document.getElementById("pointer");
  const r = p.getBoundingClientRect();
  p.style.left = `${e.clientX - r.width / 2}px`;
  p.style.top = `${e.clientY - r.height / 2}px`;
});
document.getElementById("display").addEventListener("mouseout", e => document.getElementById("pointer").className = "");
document.getElementById("display").addEventListener("mouseover", e => document.getElementById("pointer").className = "mouseon");
document.getElementById("display").addEventListener("mousedown", e => document.getElementById("pointer").classList.add("mousedown"));
document.getElementById("display").addEventListener("mouseup", e => document.getElementById("pointer").classList.remove("mousedown"));