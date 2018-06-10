RSpec.describe ParseableCsvString do
  def parseable_string_from(string)
    log = LogHelper::FakeLog.new
    parseable_string = ParseableCsvString.new(log).from_string(string)
    [log, parseable_string]
  end

  describe 'encoding' do
    it 'translates encoding' do
      test_string = '"hi",\N,"bye"'.force_encoding('ASCII-8BIT')
      log, parseable_string = parseable_string_from(test_string)

      expect(parseable_string.encoding.name).to eq 'UTF-8'
      expect(log.output).to include('stripped 0 quotes')
      expect(log.output).to include('stripped 0 newlines')
      expect(log.output).not_to include ('invalid character')
      expect(parseable_string).to eq '"hi",\N,"bye"'
    end

    it 'translates encoding with know invalid characters' do
      test_string = "\"hi\",\N,\"eating at sam\x92s caf\xE9\"".force_encoding('ASCII-8BIT')
      log, parseable_string = parseable_string_from(test_string)

      expect(parseable_string.encoding.name).to eq 'UTF-8'
      expect(log.output).to include ('converted 2 known invalid character encodings')
      expect(parseable_string).to eq "\"hi\",\N,\"eating at sam’s café\""
    end

    it 'warns and strips unknown invalid characters' do
      test_string = "\"hi\",\N,\"eating s\xF2mething\"".force_encoding('ASCII-8BIT')
      log, parseable_string = parseable_string_from(test_string)

      expect(parseable_string.encoding.name).to eq 'UTF-8'
      expect(log.output).to include ('failed to convert 1 unexpected invalid character encodings for ["\xF2"]')
      expect(parseable_string).to eq "\"hi\",\N,\"eating smething\""
    end
  end

  it 'converts invalid quotes' do
    log, parseable_string = parseable_string_from("\"hi there \\\" person\",\N,\"bye\"")

    expect(log.output).to include('stripped 1 quotes')
    expect(parseable_string).to eq "\"hi there \"\" person\",\N,\"bye\""
  end

  it 'converts inline newlines to spaces' do
    log, parseable_string = parseable_string_from("\"hi there\\\r\n person\",\N,\"bye\"")

    expect(log.output).to include('stripped 1 newline')
    expect(parseable_string).to eq "\"hi there  person\",\N,\"bye\""
  end
end
