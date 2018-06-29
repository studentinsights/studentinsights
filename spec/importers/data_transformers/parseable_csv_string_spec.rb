RSpec.describe ParseableCsvString do
  def parseable_string_from(string)
    log = LogHelper::FakeLog.new
    parseable_string = ParseableCsvString.new(log).from_string(string)
    [log, parseable_string]
  end

  # verify we can actually parse without raising
  def parse(parseable_string)
    rows = []
    CSV.new(parseable_string, {
      header_converters: :symbol,
      encoding: 'binary:UTF-8'
    }).each.with_index do |row, index|
      rows << row
    end
    rows
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
      expect { parse(parseable_string) }.not_to raise_error
    end

    it 'translates encoding with know invalid characters' do
      test_string = "\"hi\",\N,\"eating at sam\x92s caf\xE9\"".force_encoding('ASCII-8BIT')
      log, parseable_string = parseable_string_from(test_string)

      expect(parseable_string.encoding.name).to eq 'UTF-8'
      expect(log.output).to include ('converted 2 known invalid character encodings')
      expect(parseable_string).to eq "\"hi\",\N,\"eating at sam’s café\""
      expect { parse(parseable_string) }.not_to raise_error
    end

    it 'warns and strips unknown invalid characters' do
      test_string = "\"hi\",\"eating s\xF2mething\"".force_encoding('ASCII-8BIT')
      log, parseable_string = parseable_string_from(test_string)

      expect(parseable_string.encoding.name).to eq 'UTF-8'
      expect(log.output).to include ('failed to convert 1 unexpected invalid character encodings for ["\xF2"]')
      expect(parseable_string).to eq '"hi","eating smething"'
      expect { parse(parseable_string) }.not_to raise_error
    end
  end

  it 'converts slash quote (`\"`) to double quote (`""`)' do
    string = '"hi there \"friend\" person","bye"'
    log, parseable_string = parseable_string_from(string)

    expect(log.output).to include('stripped 2 quotes')
    expect(parseable_string).to eq '"hi there ""friend"" person","bye"'
    expect { parse(parseable_string) }.not_to raise_error
  end

  it 'does not get confused by `\\"` sequence and mistakenly convert slash quote' do
    string = '"hi there friend\\","bye"'
    log, parseable_string = parseable_string_from(string)

    puts string
    puts log.output
    puts parseable_string

    expect(log.output).to include('stripped 0 newline')
    expect(log.output).to include('stripped 0 quotes')
    expect(parseable_string).to eq '"hi there friend\","bye"'
    expect { parse(parseable_string) }.not_to raise_error
  end

  it 'converts `\CRLF` and does not get confused by `\\"`' do
    string = "\"123\",\"456\",\"1\",\"0\",\"0\",\N,\"0\",\"mom sick\\\r\n\\\\\",\"2015-03-01\",\"SCHOOL\""
    log, parseable_string = parseable_string_from(string)

    expect(log.output).to include('stripped 1 newline')
    expect(log.output).to include('stripped 0 quotes')
    expect(parseable_string).to eq "\"123\",\"456\",\"1\",\"0\",\"0\",\N,\"0\",\"mom sick \\\\\",\"2015-03-01\",\"SCHOOL\""
    expect { parse(parseable_string) }.not_to raise_error
  end

  it 'works on New Bedford test case' do
    string = '"312","321","something","2014-03-02","07:23:00","Classroom","saying: \"no.\"\"no way.\"\"no thanks.\"\"do not want.\"","654"'
    log, parseable_string = parseable_string_from(string)

    puts string
    puts log.output
    puts parseable_string
    # expect(log.output).to include('stripped 1 newline')
    # expect(log.output).to include('stripped 0 quotes')
    # expect(parseable_string).to eq "\"123\",\"456\",\"1\",\"0\",\"0\",\N,\"0\",\"mom sick \\\\\",\"2015-03-01\",\"SCHOOL\""
    expect { parse(parseable_string) }.not_to raise_error
  end

  it 'converts inline newlines to spaces' do
    log, parseable_string = parseable_string_from("\"hi there\\\r\n person\",\N,\"bye\"")

    expect(log.output).to include('stripped 1 newline')
    expect(log.output).to include('stripped 0 quotes')
    expect(parseable_string).to eq "\"hi there  person\",\N,\"bye\""
    expect { parse(parseable_string) }.not_to raise_error
  end
end
