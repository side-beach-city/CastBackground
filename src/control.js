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
    let autoplay = "";
    let autoplay_chk = document.getElementById("autoplay");
    if(autoplay_chk.checked){
      autoplay = " autoplay";
    }
    switch (true) {
      case /image\/\w+/.test( data.type ):
        html = `<img src="${data.url}">`;
        break;
      case /video\/\w+/.test( data.type ):
        html = `<video src="${data.url}" controls${autoplay}>`;
        break;
      case /audio\/\w+/.test( data.type ):
        html = `<audio src="${data.url}" controls${autoplay}>`;
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
    // タイプコントロールを表示
    Array.from(document.querySelectorAll(".typecontrol")).forEach((e) => {
      e.style.display = "none";
    });
    let clsn = data.type.split("/").shift();
    let cls = document.querySelector(`.${clsn}`);
    if(cls != null){
      cls.style.display = "inline";
    }
    window.opener.document.getElementById("display").innerHTML = html;
  });
};

document.getElementById("addurl").addEventListener("click", (e) => {
  let dlg = document.getElementById("addurl_dialog");
  document.getElementById("url_text").value = "";
  document.getElementById("url_ok").addEventListener("click", (e) => {
    let data = {
      "name": document.getElementById("url_text").value,
      "type": "url",
      "url": document.getElementById("url_text").value
    }
    addQueueItem(data);
    dlg.close();
  });
  document.getElementById("url_cancel").addEventListener("click", (e) => {
    dlg.close();
  });
  dlg.showModal();
});
/**
 * queueにアイテムを追加する
 * @param {Object} item 追加する項目
 */
function addQueueItem(item){
  let queue = document.getElementById("queue");
  let option = document.createElement("option");
  option.text = `${item.type}:${item.name}`;
  option.value = JSON.stringify(item);
  queue.appendChild(option);
}