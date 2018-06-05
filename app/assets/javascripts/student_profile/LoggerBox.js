import _ from 'lodash';


function createEl(attachToEl) {
  const el = document.createElement('div');
  el.style.position = 'fixed';
  el.style.width = '400px';
  el.style.backgroundColor = 'white';
  el.style.color = 'red';
  el.style.border = '1px solid darkred';
  el.style.opacity = '1';
  el.style.top = 0;
  el.style.bottom = 0;
  el.style.right = 0;
  el.style.fontSize = '10px';
  el.style.padding = '10px';
  el.style.overflowY = 'scroll';
  el.style.whiteSpace = 'pre-wrap';

  attachToEl.appendChild(el);

  return el;
}

export default class LoggerBox {
  constructor(attachToEl) {
    this.attachToEl = attachToEl;
    this.onClick = this.onClick.bind(this);
    return this;
  }

  destroy() {
    this.attachToEl.remove(this.el);
    this.el.removeEventListener('click', this.onClick);
    return undefined;
  }

  log(...params) {
    if (!this.el) {
      this.el = createEl(this.attachToEl);
      this.el.addEventListener('click', this.onClick);
    }

    // log
    const msg = params.map(p => _.isObject(p) ? JSON.stringify(p) : p).join(', ');
    this.el.innerHTML = this.el.innerHTML + "\n" + msg;
    console.log(...params); // eslint-disable-line no-console

    // scroll?

    return undefined;
  }

  onClick() {
    this.el.innerHTML = '';
  }
}