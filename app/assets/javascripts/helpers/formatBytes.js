// see https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
const k = 1024;
const defaultSizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export default function formatBytes(bytes, options = {}) {
  const sizes = options.sizes || defaultSizes;
  if (bytes == 0) return `0 ${sizes[0]}`;
  const dm = options.decimals || 2;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
