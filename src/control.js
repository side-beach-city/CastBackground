window.onload = (e) => {
  let df = document.querySelector(".droppable");
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
      option.text = `${file.name}(${file.type})`;
      option.value = JSON.stringify({
        "type": file.type,
        "url": URL.createObjectURL(file)
      });
      queue.appendChild(option);
    });
  });
  let queue = document.getElementById("queue")
  queue.addEventListener("click", (e) => {
    let data = JSON.parse(queue.value);
    let html = "";
    switch (true) {
      case /image\/\w+/.test( data.type):
        html = `<img src="${data.url}">`;
        break;
      case data.type === "":
        html = `Unknown MIME Type`;
        break;
      default:
        html = `Unsupported Type ${data.type}`
        break;
    }
    window.opener.document.getElementById("display").innerHTML = html;
  });
};