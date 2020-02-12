# See also fAndPInterpreter.js
class FAndPInterpreter
  # For interpreting user input like A/C or A+ or H(indep) or B-C
  # for each, round down (latest independent 'mastery' level)
  # if not found in list of levels and can't understand, return null
  # See also fAndPInterpreter.js
  def interpret_f_and_p_english(text) 
    # always trim whitespace
    if text.length != text.strip().length
      return interpret_f_and_p_english(text.strip())
    end

    # F, NR, AA (exact match)
    exact_match = strict_match_for_f_and_p_level(text)
    if exact_match.present?
      return exact_match
    end

    # F+
    if text.ends_with?('+')
      return strict_match_for_f_and_p_level(text[0...-1])
    end

    # F?
    if text.ends_with?('?')
      return strict_match_for_f_and_p_level(text[0...-1])
    end

    # F-G or F/G
    if text.include?('/')
      return strict_match_for_f_and_p_level(text.split('/')[0])
    end
    if text.include?('-')
      return strict_match_for_f_and_p_level(text.split('-')[0])
    end

    # F (indep) or F (instructional)
    if text.include?('(')
      return strict_match_for_f_and_p_level(text.gsub(/\([^)]+\)/, ''))
    end

    return nil
  end

  def ordering(text)
    level = interpret_f_and_p_english(text)
    ORDERED_F_AND_P_ENGLISH_LEVELS.fetch(level, 0)
  end

  private
  # See also fAndPInterpreter.js
  # Only letters and whitespace, no other characters
  def strict_match_for_f_and_p_level(text)
    normalized = text.strip().upcase
    if ORDERED_F_AND_P_ENGLISH_LEVELS.has_key?(normalized)
      normalized
    else
      nil
    end
  end

  # See also fAndPInterpreter.js
  ORDERED_F_AND_P_ENGLISH_LEVELS = {
    'NR' => 50,
    'AA' => 80,
    'A' => 110,
    'B' => 120,
    'C' => 130,
    'D' => 150,
    'E' => 160,
    'F' => 170,
    'G' => 180,
    'H' => 190,
    'I' => 200,
    'J' => 210,
    'K' => 220,
    'L' => 230,
    'M' => 240,
    'N' => 250,
    'O' => 260,
    'P' => 270,
    'Q' => 280,
    'R' => 290,
    'S' => 300,
    'T' => 310,
    'U' => 320,
    'V' => 330,
    'W' => 340,
    'X' => 350,
    'Y' => 360,
    'Z' => 370 # Z+ is also a special case per F&P docs, but ignore it for now since folks use + a lot of different places
  }
end
