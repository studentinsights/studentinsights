# typed: true
# These are regex heuristics, developed and tested and production data.
# Updating this requires production data quality checks.
class IepTextParser
  def initialize(raw_text)
    @raw_text = raw_text
  end

  def parsed_json
    {
      cleaned_text: cleaned_text,
      segments: segments,
      any_grid: any_grid?,
      match_dates: match_dates
    }
  end

  # Lots of heuristics here, from looking at data manually
  # (ideally, we'd import the structured data instead).
  def cleaned_text
    @cleaned_text ||= @raw_text
      .gsub(/( +)/, ' ') # replace multiple spaces
      .gsub(/-\n(\w)/, '\1') # undo hyphenation across lines or pages
      .gsub(/\n( +)(\w)/, "\n\\2") # remove indent after newline
      .gsub(/([a-z])\n\n([a-z])/, '\1\2') # no newlines cutting between sentences
      .gsub(/\n\n(\n+)/, "\n\n") # newlines beyond 2
      .strip # leading and trailing
  end

  # 6/17/19 sample: 215/247
  def any_grid?
    return true if cleaned_text.match(/Grid (\w)/).present?
    return true if cleaned_text.match(/Service Delivery/).present?
    false
  end

  # 6/7/19 sample: 247/247
  # this covers multiple variations
  def match_dates
    attempts = [
      iep_dates(cleaned_text),
      for_iep_from(cleaned_text),
      begin_and_end_date(cleaned_text)
    ].compact

    # throw out ones that can't parse as dates
    valid_attempts = attempts.select do |attempt|
      return false if (Date.strptime(attempt[0], '%m/%d/%Y') rescue nil).nil?
      return false if (Date.strptime(attempt[1], '%m/%d/%Y') rescue nil).nil?
      true
    end
    return nil if valid_attempts.size == 0

    # return nil not all consistent throughout the doc
    unique_attempts = valid_attempts.uniq do |attempt|
      attempt.join(' to ')
    end
    return nil if unique_attempts.size != 1

    unique_attempts.first
  end

  def segments
    PragmaticSegmenter::Segmenter.new({
      text: cleaned_text,
      language: 'en',
      doc_type: 'pdf'
    }).segment
  end

  private
  def iep_dates(text)
    matches = text.match(/IEP Dates:(\s*)([^\s-]*)([\s-]+)([^\s-]*)/)
    return nil if matches.nil?
    [matches[2], matches[4]]
  end

  def for_iep_from(text)
    matches = text.match(/For IEP from(\s+)([\d\/]+)(\s+)to(\s+)([\d\/]*)/)
    return nil if matches.nil?
    [matches[2], matches[5]]
  end

  def begin_and_end_date(text)
    start_match  = text.match(/IEP Begin Date:(\s+)([^\s]*)(\s+)IEP/)
    return nil if start_match.nil?
    end_match = text.match(/IEP End Date:(\s+)([^\s]*)(\s+)Parent/)
    return nil if end_match.nil?
    [start_match[2], end_match[2]]
  end

  # 6/7/19 sample: 174/247
  # prefer the value on the Student model, it's more authoritative administratively
  # anyway.
  def unreliable_match_primary_disability
    matches = cleaned_text.match(/Primary Disability:(\s+)([^\s]*)(\s+)Case Manager/)
    return nil if matches.nil?
    matches[2]
  end
end
