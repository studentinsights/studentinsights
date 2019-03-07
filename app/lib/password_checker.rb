# Perform checks on passwords, computed stats and then throwing some bits away
# and encrypting the result.
class PasswordChecker
  def initialize(options = {})
    @sodium_box = options.fetch(:sodium_box, SodiumBox.new(ENV['PASSWORD_CHECKER_SECRET64']))
    @logger = options.fetch(:logger, Rails.logger)
  end

  # This only stores some data, and does so without the password hash, login, or timestamp.
  # The intention is to gauge how much this is worth exploring further (eg, prompts
  # for users to change passwords).
  def json_stats_encrypted(password)
    @logger.info('> PasswordChecker#json_stats_encrypted:test...')
    result = Zxcvbn.test(password)
    @logger.info('> PasswordChecker#json_stats_encrypted:stats...')
    stats = {
      score: result.score,
      guesses_log10_floor: result.guesses_log10.floor,
      has_warning: result.feedback['warning'] != ''
    }
    @logger.info('> PasswordChecker#json_stats_encrypted:to_json...')
    json_stats = stats.to_json
    @logger.info('> PasswordChecker#json_stats_encrypted:encrypt64...')
    @sodium_box.encrypt64(json_stats)
  end
end
