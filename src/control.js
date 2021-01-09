window.onload = (e) => {
  dragDropSupport(".droppable");
  queue.addEventListener("change", loadQueue);
};

//#region 汎用コントロールバー処理

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

document.getElementById("removeitem").addEventListener("click", (e) => {
  let queue = document.getElementById("queue");
  let data = JSON.parse(queue.value);
  if(confirm("項目を削除します")){
    queue.remove(queue.selectedIndex);
    if(data.type == "url"){
      let frame = window.opener.document.getElementById(window.btoa(data.url));
      window.opener.document.body.removeChild(frame);
    }else{
      URL.revokeObjectURL(data.url);
    }
  }
});

//#endregion

//#region Audio、Videoコントロールバー処理

document.getElementById("playpause").addEventListener("click", (e) => {
  let element = window.opener.document.getElementById("content");
  element.muted = true;
  if(element.paused){
    element.play()
  }else{
    element.pause();
  }
  element.muted = false;
});

document.getElementById("stop").addEventListener("click", (e) => {
  let element = window.opener.document.getElementById("content");
  element.muted = false;
  element.pause()
  element.currentTime = 0;
});

//#endregion

//#region テキストコントロールバー処理

document.getElementById("fontsize").addEventListener("change", (e) => {
  let element = window.opener.document.getElementById("content");
  element.style.fontSize = document.getElementById("fontsize").value;
})

//#endregion

function dragDropSupport(element) {
  let df = document.querySelector(element);
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
}

function loadQueue(e) {
  let queue = document.getElementById("queue");
  let data = JSON.parse(queue.value);
  let wo = window.opener;
  Array.from(wo.document.getElementsByTagName("iframe")).forEach(e => e.style.display="none");
  wo.document.getElementById("display").innerHTML = "";
  if(data.type != "url"){
    // URL以外
    let html = "";
    let autoplay = "";
    let autoplay_chk = document.getElementById("autoplay");
    if(autoplay_chk.checked){
      autoplay = " autoplay";
    }
    // コンテント読み込み
    switch (true) {
      case /image\/\w+/.test( data.type ):
        html = `<img src="${data.url}" id="content">`;
        break;
      case /video\/\w+/.test( data.type ):
        html = `<video src="${data.url}" controls${autoplay} id="content">`;
        break;
      case /audio\/\w+/.test( data.type ):
        html = `<audio src="${data.url}" controls${autoplay} id="content">`;
        break;
      case data.type === "text/html":
        html = `<div id="content">${data.text}</div>`;
        break;
      case /text\/\w+/.test( data.type ):
        html = `<p id="content">${data.text}</p>`;
        break;
      case data.type === "":
        html = `<p id="content">Unknown MIME Type</p>`;
        break;
      default:
        html = `<p id="content">Unsupported Type ${data.type}</p>`
        break;
    }
    // タイプコントロールを表示
    Array.from(document.querySelectorAll(".typecontrol")).forEach((e) => {
      e.style.display = "none";
    });
    document.getElementById("fontsize").value = "medium";
    let clsn = data.type.split("/").shift();
    let cls = document.querySelector(`.${clsn}`);
    if(cls != null){
      cls.style.display = "inline";
    }
    wo.document.getElementById("display").innerHTML = html;
  }else{
    // URL
    let id = window.btoa(data.url);
    let iframe = wo.document.getElementById(id);
    iframe.style.display = "";
  }
}

/**
 * queueにアイテムを追加する。既に登録されているアイテムは登録されない
 * @param {Object} item 追加する項目
 * @returns {boolean} 追加できた場合はtrue。
 */
function addQueueItem(item){
  let queue = document.getElementById("queue");
  let text = `${item.type}:${item.name}`;
  if(Array.from(queue.options).filter((e) => e.textContent == text).length == 0) {
    let option = document.createElement("option");
    option.text = `${item.type}:${item.name}`;
    option.value = JSON.stringify(item);
    queue.appendChild(option);
    if(item.type === "url"){
      let frame = window.opener.document.createElement("iframe");
      frame.id = window.btoa(item.url);
      frame.src = item.url;
      frame.dataset.nativeUrl = item.url;
      frame.className = "content";
      frame.style.display = "none";
      window.opener.document.body.appendChild(frame);
    }
    return true;
  }else{
    return false;
  }
}