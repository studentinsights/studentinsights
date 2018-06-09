// For mocking history API
export default function mockHistory() {
  return {
    replaceState: jest.fn(),
    pushState: jest.fn()
  };
}