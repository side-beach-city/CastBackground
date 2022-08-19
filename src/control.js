import { QueueListItem, initButtonBars } from "./queueitem.js";
import { initSaveControl } from "./savecontrol.js";
const SETTING_DEBUG = "debug";
const SETTING_CUSTOMCSS = "customcss";
const BGMUSIC_ID = "bgmusic_elem";
const APPNAME = "CastBackground";
const APPVERSION = "1.6.0";
window.x_debugmode = false;

let activeData;

initSaveControl({ 
  "bgmvolume": 1.0,
  "pointer-visible": "true",
  "pointer-emphasis": "none"
}, () => {
  set_zoomlevel(1.0, true);
  dragDropSupport(".droppable");
  let queue = document.getElementById("queue");
  queue.addEventListener("dblclick", loadQueue);
  let customcss = document.getElementById("custom-css");
  window.opener.document.getElementById("custom-css").textContent = customcss.value = localStorage.getItem(SETTING_CUSTOMCSS);
  window.x_debugmode = localStorage.getItem(SETTING_DEBUG) === "true";
  window.x_ownerunload = false;
  document.getElementById("version").textContent = `${APPNAME} Version ${APPVERSION}.`;
  initButtonBars();
  // ドロップダウンメニューにおけるチェックボックスクリック時のポップアップ解除を行なわない
  $('.custom-switch').on('click.bs.dropdown.data-api', (event) => event.stopPropagation());
  $('#version').on('click.bs.dropdown.data-api', (event) => event.stopPropagation());
});

window.onbeforeunload  = (e) => {
  localStorage.setItem(SETTING_CUSTOMCSS, document.getElementById("custom-css").value);
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
    let data = new QueueListItem(url, "url", url);
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
    let data = QueueListItem.LoadFromSelectbox(queue);
    if(data.isPlayable){
      let media = window.opener.document.querySelector(".content");
      media.controls = control_chk.checked;
    }
  }
});

document.getElementById("bgm").addEventListener("click", (e) => {
  let bgm;
  if(bgm = window.opener.document.getElementById(BGMUSIC_ID)){
    if(document.getElementById("bgm").checked){
      bgm.currentTime = 0;
      bgm.play();
    }else{
      bgm.pause();
    }
  }
});

document.getElementById("bgmvolume").addEventListener("input", (e) => {
  let bgm;
  if(bgm = window.opener.document.getElementById(BGMUSIC_ID)){
    bgm.volume = document.getElementById("bgmvolume").value;
  }
});

document.getElementById("showcustomcss").addEventListener("click", (e) => {
  let dlg = document.getElementById("customcss");
  let css = document.getElementById("custom-css").value;
  document.getElementById("css_ok").addEventListener("click", (e) => {
    dlg.close();
  });
  document.getElementById("css_cancel").addEventListener("click", (e) => {
    window.opener.document.getElementById("custom-css").textContent = document.getElementById("custom-css").value = css;
    dlg.close();
  });
  dlg.showModal();
});

document.getElementById("custom-css").addEventListener("input", (e) => {
  window.opener.document.getElementById("custom-css").textContent = document.getElementById("custom-css").value;
});

document.getElementById("pointer-visible").addEventListener("change", (e) => {
  window.opener.document.body.style.cursor = e.target.checked ? "default" : "none";
});

document.querySelectorAll("input[name=pointer-emphasis]").forEach(v => v.addEventListener("change", (e) => {
  window.opener.document.body.className = e.target.value;
}));

//#endregion

//#region Audio、Videoコントロールバー処理

document.getElementById("playpause").addEventListener("click", (e) => {
  let element = window.opener.document.querySelector(".content");
  element.muted = true;
  if(element.paused){
    element.play()
  }else{
    element.pause();
  }
  element.muted = false;
});

document.getElementById("stop").addEventListener("click", (e) => {
  let element = window.opener.document.querySelector(".content");
  element.muted = false;
  element.pause()
  element.currentTime = 0;
});

document.getElementById("back10").addEventListener("click", (e) => {
  let element = window.opener.document.querySelector(".content");
  element.currentTime = Math.max(element.currentTime - 10, 0);
});

document.getElementById("ff10").addEventListener("click", (e) => {
  let element = window.opener.document.querySelector(".content");
  element.currentTime = Math.min(element.currentTime + 10, element.duration);
});

document.getElementById("video_volume").addEventListener("input", (e) => {
  let element = window.opener.document.querySelector(".content");
  let v = element.volume = document.getElementById("video_volume").value;
  document.getElementById("video_volume_value").textContent = v;
});

document.getElementById('mediaseek').addEventListener("click", (e) => {
  let media = window.opener.document.querySelector(".content");
  const duration = Math.round(media.duration)
  if(!isNaN(duration)){
    const mouse = e.pageX;
    const element = document.getElementById('mediaseek');
    const rect = element.getBoundingClientRect();
    const position = rect.left + window.pageXOffset;
    const offset = mouse - position;
    const width = rect.right - rect.left;
    media.currentTime = Math.round(duration * (offset / width));
  }
})
//#endregion

//#region テキストコントロールバー処理

document.getElementById("fontsize").addEventListener("change", (e) => {
  let element = window.opener.document.querySelector(".content");
  element.style.fontSize = document.getElementById("fontsize").value;
})

//#endregion

//#region URLコントロールバー処理

document.getElementById("sitezoom").addEventListener("change", (e) => {
  set_zoomlevel(document.getElementById("sitezoom").value.slice(1), false);
});

document.getElementById("sitezoom_reset").addEventListener("click", (e) => {
  set_zoomlevel(1.0, true);
});

/**
 * URL表示用iframeののズームレベル更新
 * @param {number} zoom ズームレベル
 * @param {boolean} update_seekbar シークバーの値を更新するかどうか。false時更新しない
 */
function set_zoomlevel(zoom, update_seekbar) {
  const TRANSLATE_TAGS = ["img", "video", "audio"];
  zoom = parseFloat(zoom).toFixed(1);
  if(update_seekbar){
    document.getElementById("sitezoom").value = `x${zoom}`;
  }
  Array.from(window.opener.document.querySelectorAll(".content")).forEach((e) => {
    let style = `scale(${zoom})`;
    let origin;
    if(TRANSLATE_TAGS.includes(e.tagName.toLowerCase()))
    {
      origin = "left top";
      if(zoom > 1.0){
        e.style.position = "static";
      }else{
        e.style.position = "absolute";
        style += " translate(-50%, -50%)";
      }
    }else{
      origin = zoom > 1.0 ? "left top" : "center";
      e.style.position = "absolute";
    }
    e.style.transform = style;
    e.style.transformOrigin = origin;
  });
  window.opener.document.getElementById("display").style.overflow = zoom > 1.0 ? "scroll" : "hidden";
  
}

//#endregion

//#region BackgroundManager処理

document.addEventListener("BGChanged", (e) => {
  if(e.detail["itemOld"]){
    e.detail["itemOld"].optionItem.classList.remove("playbg");
    switch (e.detail["itemType"]) {
      case "music":
        window.opener.document.getElementById(BGMUSIC_ID).remove();
        break;
      case "image":
        window.opener.document.getElementById("background").style.backgroundImage = "";
        break;
      default:
        throw "Unknown Item Type";
    }
  }
  let itemNew = e.detail["itemNew"];
  if(itemNew){
    itemNew.optionItem.classList.add("playbg"); 
    switch (e.detail["itemType"]){
      case "music":
        let autoplay = document.getElementById("playbgm").checked ? " autoplay" : "";
        let bgobj = `<${itemNew.generalType} src="${itemNew.url}" loop="true" id="${BGMUSIC_ID}"${autoplay}>`;
        window.opener.document.getElementById("background").innerHTML = bgobj;
        window.opener.document.getElementById(BGMUSIC_ID).volume = document.getElementById("bgmvolume").value;
        break;
      case "image":
        window.opener.document.getElementById("background").style.backgroundImage = `url(${itemNew.url})`;
        break;
      default:
        throw "Unknown Item Type"
    }
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
      let data = new QueueListItem(file.name, file.type, URL.createObjectURL(file));
      if(file.type.startsWith("text")){
        let reader = new FileReader();
        reader.addEventListener("load", () => {
          data.status = reader.result;
          addQueueItem(data);
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
  let data = activeData = QueueListItem.LoadFromSelectbox(queue);
  let wo = window.opener;
  Array.from(wo.document.getElementsByTagName("iframe")).forEach(e => e.style.display="none");
  Array.from(wo.document.querySelectorAll(".content")).forEach((e) => {
    if(e.tagName.toLowerCase() == "iframe"){
      e.classList.remove("content");
    }else{
      e.remove();
    }
  });
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
        html = `<img src="${data.url}" class="content">`;
        break;
      case /video\/\w+/.test( data.type ):
        html = `<video src="${data.url}"${control}${autoplay} data-name="${data.name}" class="content">`;
        break;
      case /audio\/\w+/.test( data.type ):
        html = `<audio src="${data.url}"${control}${autoplay} data-name="${data.name}" class="content">`;
        break;
      case data.type === "text/html":
        html = `<div class="content">${data.status}</div>`;
        break;
      case data.type === "application/pdf":
        html = `<iframe class="content" src="${data.url}"></iframe>`;
        break;
      case /text\/\w+/.test( data.type ):
        html = `<p class="content">${data.status}</p>`;
        break;
      case data.type === "":
        html = `<p class="content">Unknown MIME Type</p>`;
        break;
      default:
        html = `<p class="content">Unsupported Type ${data.type}</p>`
        break;
    }
    wo.document.getElementById("display").innerHTML += html;
  }else{
    // URL
    let id = window.btoa(data.url);
    let iframe = wo.document.getElementById(id);
    iframe.classList.add("content");
    iframe.style.display = "";
  }
  // タイプコントロールを表示
  Array.from(document.querySelectorAll(".typecontrol")).forEach((e) => {
    e.style.display = "none";
  });
  document.getElementById("mediatime").textContent = "0:00";
  document.getElementById("fontsize").value = "medium";
  document.getElementById("video_volume").value = 1;
  document.getElementById("video_volume_value").textContent = document.getElementById("video_volume").value;
  set_zoomlevel(1.0, true);
  let clsn = data.generalType;
  if(clsn != ""){
    let cls = document.querySelector(`.${clsn}`);
    // ステータスバーを拡張
    if(cls != null){
      cls.style.display = "inline";
      let controlbar = document.getElementById("controlbar");
      if(controlbar.offsetHeight < 80){
        controlbar.style.height = `${controlbar.offsetHeight * 2}px`;
        document.getElementById("typecontrols").style.display = "block";
        Array.from(controlbar.querySelectorAll(".subcontrolbar")).forEach((e) => {
          e.classList.add("multiline");
        })
      }
    }
    // ビデオ・オーディオ時の更新処理追加
    if(data.isPlayable){
      let media = window.opener.document.querySelector(".content");
      media.addEventListener("durationchange", (e) => {
        if(activeData.status > 0 && activeData.status < media.duration - 2){
          media.currentTime = activeData.status;
        }  
      });
      media.addEventListener("timeupdate", (e) => {
        if(media && typeof media.duration == "number" && typeof media.currentTime == "number"){
          let queue = document.getElementById("queue");
          let index = Array.from(queue.options).findIndex(e => JSON.parse(e.value).name == media.dataset.name);
          if(index != -1){
            let data = QueueListItem.LoadFromJSON(queue[index].value);
            data.optionItem = queue[index];
            data.status = media.currentTime;
            let time = Math.floor(media.duration - media.currentTime);
            let m = Math.floor(time / 60);
            let s = Math.floor((time - m * 60) % 60);
            const percent = Math.round((media.currentTime / media.duration) * 1000) / 10;
            document.getElementById("mediatime").textContent = `${m}:${("00" + s).slice(-2)}`;
            document.getElementById('mediaseek').style.backgroundSize = percent + '%'
            data.update();
          }
        }
      });
    }
  }
  document.getElementById("zoomcontrol").style.display = "inline";
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
    option.value = item.JSONString;
    queue.appendChild(option);
    if(item.type === "url"){
      option.classList.add("loading")
      let frame = window.opener.document.createElement("iframe");
      frame.id = window.btoa(item.url);
      frame.src = item.url;
      frame.dataset.nativeUrl = item.url;
      frame.style.display = "none";
      frame.onload = (e) => {
        option.classList.remove("loading")
      }
      window.opener.document.getElementById("display").appendChild(frame);
    }
    return true;
  }else{
    return false;
  }
}
