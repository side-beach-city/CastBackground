window.onload = (e) => {
  let df = document.getElementById("droppable");
  df.addEventListener("dragover", (e) => {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, false);
  df.addEventListener("drop", (e) => {
    e.stopPropagation();
    e.preventDefault();

    let files = e.dataTransfer.files;
    let queue = document.getElementById("queue")
    Array.from(files).forEach(file => {
      let option = document.createElement("option");
      option.text = file.name;
      option.value = URL.createObjectURL(file);
      queue.appendChild(option);
    });
  });
  let queue = document.getElementById("queue")
  queue.addEventListener("click", (e) => {
    window.opener.document.getElementById("display").
      src = queue.value;
  });
};