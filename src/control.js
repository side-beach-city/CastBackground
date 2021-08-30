const SETTING_AUTOPLAY = "autoplay";
const SETTING_CONTROLS = "controls";
const SETTING_DEBUG = "debug";
window.x_debugmode = false;
window.onload = (e) => {
  dragDropSupport(".droppable");
  let queue = document.getElementById("queue");
  queue.addEventListener("dblclick", loadQueue);
  let control_chk = document.getElementById("controls");
  let autoplay_chk = document.getElementById("autoplay");
  control_chk.checked = localStorage.getItem(SETTING_CONTROLS) === "true";
  autoplay_chk.checked = localStorage.getItem(SETTING_AUTOPLAY) === "true";
  window.x_debugmode = localStorage.getItem(SETTING_DEBUG) === "true";
  window.x_ownerunload = false;
  setTimeout(tickTime, 100);
};

window.onbeforeunload  = (e) => {
  localStorage.setItem(SETTING_CONTROLS, document.getElementById("controls").checked);
  localStorage.setItem(SETTING_AUTOPLAY, document.getElementById("autoplay").checked);
  if(!window.x_ownerunload){
    e.preventDefault();
    e.returnValue = "check";
  }
}

window.onfocus = (e) => {
  window.x_ownerunload = false;
}

//#region 汎用コントロールバー処理

document.getElementById("addurl").addEventListener("click", (e) => {
  let dlg = document.getElementById("addurl_dialog");
  document.getElementById("url_text").value = "";
  document.getElementById("url_ok").addEventListener("click", (e) => {
    let url = document.getElementById("url_text").value;
    let m = /(?:www\.youtube\.com\/watch\?v=|youtu\.be\/)(\w+)/.exec(url);
    if(m){
      url = `https://www.youtube.com/embed/${m[1]}`;
    }
    let data = {
      "name": url,
      "type": "url",
      "url": url
    }
    addQueueItem(data);
    dlg.close();
  });
  document.getElementById("url_cancel").addEventListener("click", (e) => {
    dlg.close();
  });
  dlg.showModal();
});

document.getElementById("controls").addEventListener("change", (e) => {
  let control_chk = document.getElementById("controls");
  let queue = document.getElementById("queue");
  if(queue.value != ""){
    let data = JSON.parse(queue.value);
    if(/(video|audio)\/\w+/.test( data.type )){
      let media = window.opener.document.getElementById("content");
      media.controls = control_chk.checked;
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

//#region URLコントロールバー処理

document.getElementById("sitezoom").addEventListener("change", (e) => {
  set_zoomlevel(document.getElementById("sitezoom").value, false);
});

document.getElementById("sitezoom_reset").addEventListener("click", (e) => {
  set_zoomlevel(1.0, true);
});

function set_zoomlevel(zoom, update_seekbar) {
  if(update_seekbar){
    document.getElementById("sitezoom").value = zoom;
  }
  Array.from(window.opener.document.querySelectorAll("iframe.content")).forEach((e) => {
    e.style.transform = `scale(${zoom})`;
  });
  document.getElementById("sitezoom_value").textContent = `x${zoom}:`;
}

//#endregion

//#region ボタンバー処理

let queue = document.getElementById("queue").addEventListener("change", (e) => {
  let queue = document.getElementById("queue");
  let rect = queue.selectedOptions[0].getBoundingClientRect();
  let data = JSON.parse(queue.value);
  let buttonbar = document.getElementById("buttonbar");
  buttonbar.style.display = "block";
  buttonbar.style.left = `${rect.right - buttonbar.getBoundingClientRect().width - 10}px`;
  buttonbar.style.top = `${rect.y}px`;
  let refreshitem = document.getElementById("refreshitem");
  refreshitem.disabled = data.type != "url";
});

document.getElementById("refreshitem").addEventListener("click", (e) => {
  let queue = document.getElementById("queue");
  let data = JSON.parse(queue.value);
  let id = window.btoa(data.url);
  let option = queue.selectedOptions[0];
  let iframe = window.opener.document.getElementById(id);
  iframe.src = data.url;
  option.classList.add("loading");
});

document.getElementById("removeitem").addEventListener("click", (e) => {
  let queue = document.getElementById("queue");
  let data = JSON.parse(queue.value);
  if(confirm(`項目${data.name}を削除します`)){
    queue.remove(queue.selectedIndex);
    if(data.type == "url"){
      let frame = window.opener.document.getElementById(window.btoa(data.url));
      window.opener.document.body.removeChild(frame);
    }else{
      URL.revokeObjectURL(data.url);
    }
    let buttonbar = document.getElementById("buttonbar");
    buttonbar.style.display = "none";
  }
});

//#endregion

/**
 * ドラッグドロップへの対応処理
 * @param {string} element ドラッグドロップに対応させるエレメントを示す、セレクタ文字列
 */
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

/**
 * キューリソースの読み込みリクエスト
 * @param {Event} e イベントオブジェクト
 */
function loadQueue(e) {
  let queue = document.getElementById("queue");
  // 表示中項目が読み込み中のものであれば、以降の処理を行わない。
  if(queue.dataset.loaded && queue.dataset.loaded == queue.value){
    return;
  }
  queue.dataset.loaded = queue.value;
  //
  let data = JSON.parse(queue.value);
  let wo = window.opener;
  Array.from(wo.document.getElementsByTagName("iframe")).forEach(e => e.style.display="none");
  wo.document.getElementById("display").innerHTML = "";
  if(data.type != "url"){
    // URL以外
    let html = "";
    let autoplay = "";
    let control = "";
    let autoplay_chk = document.getElementById("autoplay");
    if(autoplay_chk.checked){
      autoplay = " autoplay";
    }
    let control_chk = document.getElementById("controls");
    if(control_chk.checked){
      control = " controls";
    }
    // コンテント読み込み
    switch (true) {
      case /image\/\w+/.test( data.type ):
        html = `<img src="${data.url}" id="content">`;
        break;
      case /video\/\w+/.test( data.type ):
        html = `<video src="${data.url}"${control}${autoplay} id="content">`;
        break;
      case /audio\/\w+/.test( data.type ):
        html = `<audio src="${data.url}"${control}${autoplay} id="content">`;
        break;
      case data.type === "text/html":
        html = `<div id="content">${data.text}</div>`;
        break;
      case data.type === "application/pdf":
        html = `<iframe id="content" src="${data.url}"></iframe>`;
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
    wo.document.getElementById("display").innerHTML = html;
  }else{
    // URL
    let id = window.btoa(data.url);
    let iframe = wo.document.getElementById(id);
    iframe.style.display = "";
  }
  // タイプコントロールを表示
  Array.from(document.querySelectorAll(".typecontrol")).forEach((e) => {
    e.style.display = "none";
  });
  document.getElementById("mediatime").textContent = "0:00";
  document.getElementById("fontsize").value = "medium";
  set_zoomlevel(1.0, true);
  let clsn = data.type.split("/").shift();
  let cls = document.querySelector(`.${clsn}`);
  if(cls != null){
    cls.style.display = "inline";
  }
}

/**
 * 定期的に呼び出されるタイマーイベント
 */
function tickTime() {
  let queue = document.getElementById("queue");
  if(queue.value != ""){
    let data = JSON.parse(queue.value);
    // video/audioの場合、残り時間表示
    if(/(video|audio)\/\w+/.test( data.type )){
      let media = window.opener.document.getElementById("content");
      if(media && media.duration && media.currentTime){
        let time = Math.floor(media.duration - media.currentTime);
        let m = Math.floor(time / 60);
        let s = Math.floor((time - m * 60) % 60);
        document.getElementById("mediatime").textContent = `${m}:${("00" + s).slice(-2)}`;
      }
    }
  }
  setTimeout(tickTime, 100);
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
      option.classList.add("loading")
      let frame = window.opener.document.createElement("iframe");
      frame.id = window.btoa(item.url);
      frame.src = item.url;
      frame.dataset.nativeUrl = item.url;
      frame.className = "content";
      frame.style.display = "none";
      frame.onload = (e) => {
        option.classList.remove("loading")
      }
      window.opener.document.body.appendChild(frame);
    }
    return true;
  }else{
    return false;
  }
}