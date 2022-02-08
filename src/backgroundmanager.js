/**
 * BGM・背景画像管理オブジェクト
 */
class BackgroundManager{
  constructor(){
    this._image = null;
    this._music = null;
  }

  /**
   * QueueListItem差し替え処理
   * @param {QueueListItem} oOld 差し替え前のオブジェクト
   * @param {QueueListItem} oNew 差し替え後のオブジェクト
   */
  updateObject(oOld, oNew){
    if(oOld){oOld.optionItem.classList.remove("playbg"); }
    if(oNew){oNew.optionItem.classList.add("playbg"); }
  }

  /**
   * 新しい背景画像を設定する
   * @param {QueueListItem} newData 新しい背景画像を示すQueueListItem
   */
  set image(newData){
    this.updateObject(this._image, newData);
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
    this.updateObject(this._music, newData);
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
