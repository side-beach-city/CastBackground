let defaultValues = {};
let valueLoaded;

/**
 * データ保存読み込み処理の初期化を行う。このメソッドを使用しなかった場合、全てデフォルト値が使用される
 * @param {[index: string]: string} values デフォルト値を示す連想配列
 * @param {function} onValueLoaded データの読み込み完了時に呼び出される関数
 */
export function initSaveControl(values, onValueLoaded) {
  if(values) defaultValues = {...defaultValues, ...values};
  valueLoaded = onValueLoaded;
}

window.addEventListener("load", (e) => {
  Array.from(document.getElementsByClassName("savecontrol")).forEach((e) => {   
    const v = localStorage.getItem(e.id) ? localStorage.getItem(e.id) : (defaultValues[e.id] !== undefined ? defaultValues[e.id] : "");
    switch (e.type) {
      case "checkbox":
        e.checked = v == "true";
        break;
      default:
        e.value = v;
        break;
    }
    e.addEventListener("change", (e) => {
      let v;
      switch (e.target.type) {
        case "checkbox":
          v = e.target.checked ? "true" : "false";
          break;
        default:
          v = e.target.value;
          break;
      }
      localStorage.setItem(e.target.id, v);
    });
  });
  if(valueLoaded) valueLoaded();
});