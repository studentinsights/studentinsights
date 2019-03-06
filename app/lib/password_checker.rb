# Perform checks on passwords, computed stats and then throwing some bits away
# and encrypting the result.
class PasswordChecker
  def initialize(options = {})
    @sodium_box = options.fetch(:sodium_box, SodiumBox.new(ENV['PASSWORD_CHECKER_SECRET64']))
  end

  # This only stores some data, and does so without the password hash, login, or timestamp.
  # The intention is to gauge how much this is worth exploring further (eg, prompts
  # for users to change passwords).
  def json_stats_encrypted(password)
    result = Zxcvbn.test(password)
    @sodium_box.encrypt64({
      score: result.score,
      guesses_log10_floor: result.guesses_log10.floor,
      has_warning: result.feedback['warning'] != ''
    }.to_json)
  end
end
