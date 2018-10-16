require 'spec_helper'

RSpec.describe SomervilleHighLevelsDefinitions do
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe '#decide_level' do
    def decide_level_output(levels_inputs_data)
      input = SomervilleHighLevelsDefinitions.levels_input(levels_inputs_data)
      level = SomervilleHighLevelsDefinitions.new.decide_level(input)
      [level.level_number, level.triggers]
    end

    it 'Level 0' do
      level = 0
      expect(decide_level_output({
        course_ds: 0,
        course_failures: 0,
        recent_discipline_actions: 0,
        recent_absence_rate: 1.0
      })).to eq [level, []]
      expect(decide_level_output({
        course_ds: 1,
        course_failures: 0,
        recent_discipline_actions: 0,
        recent_absence_rate: 1.0
      })).to eq [level, []]
      expect(decide_level_output({
        course_ds: 1,
        course_failures: 0,
        recent_discipline_actions: 0,
        recent_absence_rate: 0.95
      })).to eq [level, []]
      expect(decide_level_output({
        course_ds: 1,
        course_failures: 0,
        recent_discipline_actions: 4,
        recent_absence_rate: 1.0
      })).to eq [level, []]
      expect(decide_level_output({
        course_ds: 0,
        course_failures: 1,
        recent_discipline_actions: 0,
        recent_absence_rate: 1.0
      })).to eq [level, []]
      expect(decide_level_output({
        course_ds: 4,
        course_failures: 0,
        recent_discipline_actions: 0,
        recent_absence_rate: 1.0
      })).to eq [level, []]
    end

    it 'Level 1: 1 F and 2 Ds OR less than 95 attendance over last 45 days' do
      expect(decide_level_output({
        course_ds: 2,
        course_failures: 1,
        recent_discipline_actions: 0,
        recent_absence_rate: 1.00
      })).to eq [1, [:academic]]
      expect(decide_level_output({
        course_ds: 0,
        course_failures: 0,
        recent_discipline_actions: 0,
        recent_absence_rate: 0.94
      })).to eq [1, [:absence]]
      expect(decide_level_output({
        course_ds: 2,
        course_failures: 1,
        recent_discipline_actions: 0,
        recent_absence_rate: 0.90
      })).to eq [1, [:academic, :absence]]
    end

    it "Level 2: 2 F's OR less than 90 attendance over last 45" do
      expect(decide_level_output({
        course_ds: 0,
        course_failures: 2,
        recent_discipline_actions: 0,
        recent_absence_rate: 0.90
      })).to eq [2, [:academic]]
      expect(decide_level_output({
        course_ds: 0,
        course_failures: 0,
        recent_discipline_actions: 0,
        recent_absence_rate: 0.89
      })).to eq [2, [:absence]]
      expect(decide_level_output({
        course_ds: 0,
        course_failures: 2,
        recent_discipline_actions: 0,
        recent_absence_rate: 0.85
      })).to eq [2, [:academic, :absence]]
    end

    it "Level 3: 3 F's OR less than 85 attendance over last 45 OR 5-6 discipline actions over the last 45 school days" do
      expect(decide_level_output({
        course_ds: 0,
        course_failures: 3,
        recent_discipline_actions: 0,
        recent_absence_rate: 1.0
      })).to eq [3, [:academic]]
      expect(decide_level_output({
        course_ds: 0,
        course_failures: 0,
        recent_discipline_actions: 0,
        recent_absence_rate: 0.84
      })).to eq [3, [:absence]]
      expect(decide_level_output({
        course_ds: 0,
        course_failures: 0,
        recent_discipline_actions: 5,
        recent_absence_rate: 1.0
      })).to eq [3, [:discipline]]
      expect(decide_level_output({
        course_ds: 0,
        course_failures: 3,
        recent_discipline_actions: 5,
        recent_absence_rate: 0.80
      })).to eq [3, [:academic, :absence, :discipline]]
    end

    it "Level 4: At least 4 F's OR less than 80% attendance over last 45 school days OR 7 or more discipline actions over the last 45 school days" do
      expect(decide_level_output({
        course_ds: 0,
        course_failures: 4,
        recent_discipline_actions: 0,
        recent_absence_rate: 1.0
      })).to eq [4, [:academic]]
      expect(decide_level_output({
        course_ds: 0,
        course_failures: 0,
        recent_discipline_actions: 0,
        recent_absence_rate: 0.79
      })).to eq [4, [:absence]]
      expect(decide_level_output({
        course_ds: 0,
        course_failures: 0,
        recent_discipline_actions: 7,
        recent_absence_rate: 1.0
      })).to eq [4, [:discipline]]
      expect(decide_level_output({
        course_ds: 0,
        course_failures: 4,
        recent_discipline_actions: 7,
        recent_absence_rate: 0.79
      })).to eq [4, [:academic, :absence, :discipline]]
    end
  end
end
