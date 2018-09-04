class TransitionNoteParser
  STRENGTHS_PROMPT = "What are this student's strengths?"
  COMMUNITY_PROMPT = "What is this student's involvement in the school community like?"
  PEERS_PROMPT = "How does this student relate to their peers?"
  GUARDIAN_PROMPT = "Who is the student's primary guardian?"
  OTHER_PROMPT = "Any additional comments or good things to know about this student?"

  def parse_text(text)
    {
      strengths: extract_one(text, STRENGTHS_PROMPT, COMMUNITY_PROMPT),
      community: extract_one(text, COMMUNITY_PROMPT, PEERS_PROMPT),
      peers: extract_one(text, PEERS_PROMPT, GUARDIAN_PROMPT),
      guardian: extract_one(text, GUARDIAN_PROMPT, OTHER_PROMPT),
      other: extract_one(text, OTHER_PROMPT)
    }
  end

  private
  def extract_one(text, before_text, after_text = nil)
    before_regex_literal = escape_to_use_as_regex_literal(before_text)
    after_regex_literal = escape_to_use_as_regex_literal(after_text)
    regex = Regexp.new(before_regex_literal + '([\\s\\S]*)' + after_regex_literal)
    match_text = regex.match(text).captures[0]
    clean(match_text)
  end

  def escape_to_use_as_regex_literal(text)
    return '' if text.nil?
    Regexp.escape(text)
  end

  def clean(text)
    text.strip.gsub('[\—\-\_]', '')
  end
end
