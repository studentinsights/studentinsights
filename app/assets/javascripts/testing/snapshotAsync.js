import renderer from 'react-test-renderer';

// Sugar for doing a snapshot test, but waiting a tick for the
// mocked fetch calls to resolve, so we can verify the substance
// of the component after the call.
export function expectSnapshotToMatchAfterTick(el, done) {
  const testRenderer = renderer.create(el);
  setTimeout(() => {
    expect(testRenderer.toJSON()).toMatchSnapshot();
    done();
  }, 0); // just a tick
}