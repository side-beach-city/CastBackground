const EVENT_NAME = "BGChanged";
/**
 * BGM・背景画像管理オブジェクト
 * このマネージャからの通知は、documentオブジェクトで発生するBGChangedイベントにより行われる。
 * イベントオブジェクトの引数は以下の通り
 * @param {String} itemType 画像であった場合"image", BGMであった場合"music"
 * @param {QueueListItem} itemOld 差し替え前のオブジェクト
 * @param {QueueListItem} itemNew 差し替え後のオブジェクト
 */
class BackgroundManager{
  constructor(){
    this._image = null;
    this._music = null;
  }

  /**
   * 新しい背景画像を設定する
   * @param {QueueListItem} newData 新しい背景画像を示すQueueListItem
   */
  set image(newData){
    document.dispatchEvent(new CustomEvent(EVENT_NAME, {
      "detail": {
        "itemType": "image",
        "itemOld": this._image,
        "itemNew": newData
      }
    }));
    this._image = newData;
  }

  /**
   * 現在の背景画像を示すQueueListItemを取得する
   * @returns {QueueListItem} 現在の背景画像
   */
  get image(){
    return this._image;
  }

  /**
   * 新しいBGMを設定する
   * @param {QueueListItem} newData 新しいBGMを示すQueueListItem
   */
  set music(newData){
    document.dispatchEvent(new CustomEvent(EVENT_NAME, {
      "detail": {
        "itemType": "music",
        "itemOld": this._music,
        "itemNew": newData
      }
    }));
    this._music = newData;
  }

  /**
   * 現在のBGMを示すQueueListItemを取得する
   * @returns {QueueListItem} 現在のBGM]
   */
  get music(){
    return this._music;
  }
}

export default new BackgroundManager();
