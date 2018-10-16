class SomervilleHighLevelsDefinitions
  def self.levels_input(options = {})
    LevelsInput.new(options)
  end

  # See internal SHS doc at https://docs.google.com/document/d/10Rm-FMeQsj_ArxqVWefa6bz8-cs2zsCEubaP3iR24KA/edit
  def decide_level(levels_input_data)
    course_ds = levels_input_data.course_ds
    course_failures = levels_input_data.course_failures
    recent_absence_rate = levels_input_data.recent_absence_rate
    recent_discipline_actions = levels_input_data.recent_discipline_actions

    # Level 4: At least 4 F's
    #   OR less than 80% attendance over last 45 school days
    #   OR 7 or more discipline actions over the last 45 school days
    level_four_triggers = [
      (:academic if course_failures >= 4),
      (:absence if recent_absence_rate < 0.80),
      (:discipline if recent_discipline_actions >= 7)
    ].compact
    return Level.new(4, level_four_triggers, levels_input_data) if level_four_triggers.size > 0

    # Level 3: 3 F's
    #   OR less than 85% attendance over last 45
    #   OR 5-6 discipline actions over the last 45 school days
    level_three_triggers = [
      (:academic if course_failures >= 3),
      (:absence if recent_absence_rate < 0.85),
      (:discipline if recent_discipline_actions >= 5)
    ].compact
    return Level.new(3, level_three_triggers, levels_input_data) if level_three_triggers.size > 0

    # Level 2: 2 F's
    #  OR less than 90% attendance over last 45
    #  (no discipline involved in calculation)
    level_two_triggers = [
      (:academic if course_failures >= 2),
      (:absence if recent_absence_rate < 0.90)
    ].compact
    return Level.new(2, level_two_triggers, levels_input_data) if level_two_triggers.size > 0

    # Level 1: 1 F and 2 Ds
    #   OR less than 95% attendance over last 45 days
    #   (no discipline involved)
    level_one_triggers = [
      (:academic if course_failures == 1 && course_ds >= 2),
      (:absence if recent_absence_rate < 0.95)
    ].compact
    return Level.new(1, level_one_triggers, levels_input_data) if level_one_triggers.size > 0

    # Level 0: Not any of the other levels
    return Level.new(0, [], levels_input_data)
  end

  private
  # Inputs to deciding
  class LevelsInput
    attr_reader :course_failures
    attr_reader :course_ds
    attr_reader :recent_absence_rate
    attr_reader :recent_discipline_actions

    def initialize(options = {})
      @course_failures = options[:course_failures]
      @course_ds = options[:course_ds]
      @recent_absence_rate = options[:recent_absence_rate]
      @recent_discipline_actions = options[:recent_discipline_actions]
    end
  end

  # Output from decision
  class Level < Struct.new(
    :level_number,
    :triggers,
    :data
  )
  end
end
