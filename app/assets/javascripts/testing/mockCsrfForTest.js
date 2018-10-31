// Mock global CSRF token, which is an implicit dependency for these
export default function mockCsrfForTest(mockToken) {
  const jQuery = jest.spyOn(window, '$');
  jQuery.mockReturnValue({ attr: () => mockToken });
}
