import BackgroundManager from "./backgroundmanager.js";

export class QueueListItem {
  /**
   * リストアイテム用の構造体を作成する。
   * @param {String} name データの名称
   * @param {String} type データのタイプ。MIME/Typeまたは"url"
   * @param {String} url データを示すURL
   * @param {Number|String} status ステータスを示す値
   */
  constructor(name, type, url, status = 0) { 
    this.name = name;
    this.type = type;
    this.url = url;  
    this.status = status;
    this.optionItem = undefined;
  }

  /**
    * オブジェクトのJSON表現を取得する。
    * @returns {String} JSON表現
    */
  get JSONString() {
    return JSON.stringify(this);
  }

  /**
   * 現在オブジェクトが参照しているデータが再生可能(videoまたはaudio)であればTrueを返却する。
   * @returns {boolean} 再生可能データであればTrue
   */
  get isPlayable() {
    return /(video|audio)\/\w+/.test( this.type );
  }

  /**
   * 現在オブジェクトが参照しているデータの種別を取得する
   * @returns {String} データの大まかなタイプ(MIMEタイプの左側文字列)
   */
  get generalType() {
    return this.type.includes("/") ? this.type.split("/")[0] : "";
  }

  /**
   * optionItemで指定したHTMLOptionElement内に保存されているJSONデータを更新する
   */
  update(){
    if(this.optionItem){
      this.optionItem.value = this.JSONString;
    }else{
      throw "optionItemが未指定です。";
    }
  }

  /**
    * JSONフォーマットの文字列よりオブジェクトを初期化する。
    * @param {String} json JSON形式の文字列
    */
  static LoadFromJSON(json){
    const data = JSON.parse(json);
    return new QueueListItem(data.name, data.type, data.url, data.status);
  }

  /**
   * HTMLの<select>タグの内容よりオブジェクトを初期化する
   * @param {HTMLSelectElement} selectObject <select>タグ
   */
  static LoadFromSelectbox(selectObject){
    const data = QueueListItem.LoadFromJSON(selectObject.value)
    data.optionItem = selectObject.selectedOptions[0];
    return data;
  }
}

/**
 * ボタンバーのイベントハンドラ設定を行う。
 */
export function initButtonBars(){

  document.getElementById("queue").addEventListener("change", (e) => {
    let queue = document.getElementById("queue");
    let rect = queue.selectedOptions[0].getBoundingClientRect();
    let data = QueueListItem.LoadFromSelectbox(queue);
    let buttonbar = document.getElementById("buttonbar");
    buttonbar.style.display = "block";
    buttonbar.style.left = `${rect.right - buttonbar.getBoundingClientRect().width - 10}px`;
    buttonbar.style.top = `${rect.y}px`;
    let refreshitem = document.getElementById("refreshitem");
    refreshitem.disabled = data.type != "url";
    let setbackground = document.getElementById("setbackground");
    setbackground.disabled = !(/(video|audio|image)\/\w+/.test( data.type ));
  });
  
  document.getElementById("setbackground").addEventListener("click", (e) => {
    let queue = document.getElementById("queue");
    let data = QueueListItem.LoadFromSelectbox(queue);
    if (data.isPlayable) {
      // BGM
      BackgroundManager.music = data;
    } else if(data.generalType == "image") {
      // BGImage
      BackgroundManager.image = data;
    }
  });
  
  document.getElementById("refreshitem").addEventListener("click", (e) => {
    let queue = document.getElementById("queue");
    let data = QueueListItem.LoadFromSelectbox(queue);
    let id = window.btoa(data.url);
    let option = queue.selectedOptions[0];
    let iframe = window.opener.document.getElementById(id);
    iframe.src = data.url;
    option.classList.add("loading");
  });
  
  document.getElementById("removeitem").addEventListener("click", (e) => {
    let queue = document.getElementById("queue");
    let data = QueueListItem.LoadFromSelectbox(queue);
    if(confirm(`項目${data.name}を削除します`)){
      queue.remove(queue.selectedIndex);
      if(BackgroundManager.music && BackgroundManager.music.url == data.url){ BackgroundManager.music = null; }
      if(BackgroundManager.image && BackgroundManager.image.url == data.url){ BackgroundManager.image = null; }
      if(data.type == "url"){
        let frame = window.opener.document.getElementById(window.btoa(data.url));
        window.opener.document.getElementById("display").removeChild(frame);
      }else{
        URL.revokeObjectURL(data.url);
      }
      let buttonbar = document.getElementById("buttonbar");
      buttonbar.style.display = "none";
    }
  });
  
}