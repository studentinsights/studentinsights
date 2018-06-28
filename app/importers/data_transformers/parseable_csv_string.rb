require 'csv'

# This class handles encoding issues with CSV strings, and other
# character translations, returning a UTF-8 string that should
# be able to be parsed by CSV#parse.
class ParseableCsvString
  def initialize(log)
    @log = log
  end

  def from_filename(filename)
    from_string(read(filename))
  end

  def from_string(raw_file_contents)
    encoded_string = encode_as_utf8(raw_file_contents)
    string_without_slash_quotes = convert_slash_quote_to_double_quote(encoded_string)
    strip_inline_newlines(string_without_slash_quotes)
  end

  private
  # Read as a raw binary encoded string
  def read(filename)
    @log.puts '#read...'
    File.open(filename, 'r:ASCII-8BIT', &:read)
  end

  # Encode as UTF-8 and handle invalid character encodings
  def encode_as_utf8(raw_file_contents)
    @log.puts '#encode_as_utf8...'

    # track encoding failures and handle some
    failed_encoding_count = 0
    replaced_encoding_count = 0
    failed_encodings = []
    encoding_fallback = Proc.new do |invalid|
      converted_value = map_invalid_encoding(invalid)
      if converted_value.nil?
        failed_encodings << invalid
        failed_encoding_count = failed_encoding_count + 1
        ''
      else
        replaced_encoding_count = replaced_encoding_count + 1
        converted_value
      end
    end

    # do the encoding
    encoded = raw_file_contents.encode('UTF-8', 'binary', fallback: encoding_fallback)
    if replaced_encoding_count > 0
      @log.puts "  converted #{replaced_encoding_count} known invalid character encodings"
    end
    if failed_encoding_count > 0
      @log.puts "  failed to convert #{failed_encoding_count} unexpected invalid character encodings for #{failed_encodings.uniq}"
    end

    encoded
  end

  # These are the known invalid encodings, and manual translations to UTF-8 encodings.
  def map_invalid_encoding(invalid_encoding)
    {
      "\xE9".force_encoding('ASCII-8BIT') => 'é',
      "\x92".force_encoding('ASCII-8BIT') => '’'
    }[invalid_encoding]
  end

  # Replace `\"` within fields to `""`, to satisfy the strict Ruby CSV parser,
  # and do not get confused and match the `\\"` sequence.
  def convert_slash_quote_to_double_quote(string)
    @log.puts '#convert_slash_quote_to_double_quote...'

    quotes_converted_count = 0
    string_without_slash_quotes = string.gsub(/([^\\])\\\"/) do |match|
      quotes_converted_count = quotes_converted_count + 1
      "#{Regexp.last_match.captures.first}\"\""
    end

    @log.puts "  stripped #{quotes_converted_count} quotes."
    string_without_slash_quotes
  end

  # Find newlines within quotes fields `\CRLF` and replace them with spaces, since
  # the Ruby CSV class can't understand that they're within the field and interpret them as a
  # broken line that hasn't closed the quote.
  # Don't get confused by escape characters before.
  def strip_inline_newlines(string)
    @log.puts '#strip_inline_newlines...'

    newlines_stripped_count = 0
    string_without_inline_newlines = string.gsub(/([^\\])\\\r\n/) do |match|
      newlines_stripped_count = newlines_stripped_count + 1
      "#{Regexp.last_match.captures.first} "
    end

    @log.puts "  stripped #{newlines_stripped_count} newlines."
    string_without_inline_newlines
  end
end
