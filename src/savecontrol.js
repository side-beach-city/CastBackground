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
  const radiobox_names = [];
  Array.from(document.getElementsByClassName("savecontrol")).forEach((e) => {   
    const v = localStorage.getItem(e.id) ? localStorage.getItem(e.id) : (defaultValues[e.id] !== undefined ? defaultValues[e.id] : "");
    switch (e.type) {
      case "checkbox":
        e.checked = v == "true";
        break;
      case "radio":
        if(!radiobox_names.includes(e.name)) radiobox_names.push(e.name);
        break;
      default:
        e.value = v;
        break;
    }
    e.dispatchEvent(new Event("change"));
    e.addEventListener("change", (e) => {
      let v;
      switch (e.target.type) {
        case "checkbox":
          localStorage.setItem(e.target.id, e.target.checked ? "true" : "false");
          break;
        case "radio":
          localStorage.setItem(e.target.name, e.target.value);
          break;
        default:
          localStorage.setItem(e.target.id, e.target.value);
          break;
      }
    });
  });
  radiobox_names.forEach((n) => {
    const v = localStorage.getItem(n);
    let c = Array.from(document.getElementsByName(n)).find((e) => e.value == v);
    if(!c) c = Array.from(document.getElementsByName(n)).find((e) => e.value == defaultValues[n]);
    if(c) c.checked = true;
  });
  if(valueLoaded) valueLoaded();
});