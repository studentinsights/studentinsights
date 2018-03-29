export default function createSpyObj(name, methods) {
  return methods.reduce((object, key) => {
    object[key] = jest.fn(); //eslint-disable-line no-undef
    return object;
  }, {});
}