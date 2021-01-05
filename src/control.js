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
      let data = {
        "name": file.name,
        "type": file.type,
        "url": URL.createObjectURL(file)
      }
      if(file.type.startsWith("text")){
        reader = new FileReader();
        reader.addEventListener("load", () => {
          addQueueItem({...data, ...{text: reader.result}})
        });
        reader.readAsText(file);
      }else{
        addQueueItem(data);
      }
    });
  });
  let queue = document.getElementById("queue")
  queue.addEventListener("change", (e) => {
    let data = JSON.parse(queue.value);
    let html = "";
    switch (true) {
      case /image\/\w+/.test( data.type ):
        html = `<img src="${data.url}">`;
        break;
      case /video\/\w+/.test( data.type ):
        html = `<video src="${data.url}" controls>`;
        break;
      case /audio\/\w+/.test( data.type ):
        html = `<audio src="${data.url}" controls>`;
        break;
      case data.type === "text/html":
        html = data.text;
        break;
      case /text\/\w+/.test( data.type ):
        html = `<p>${data.text}</p>`;
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

/**
 * queueにアイテムを追加する
 * @param {Object} item 追加する項目
 */
function addQueueItem(item){
  let option = document.createElement("option");
  option.text = `${item.type}:${item.name}`;
  option.value = JSON.stringify(item);
  queue.appendChild(option);
}