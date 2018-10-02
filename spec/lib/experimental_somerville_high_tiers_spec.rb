require 'spec_helper'

RSpec.describe ExperimentalSomervilleHighTiers do
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe '#students_with_tiering_json' do
    it 'works correctly' do
      tiers = ExperimentalSomervilleHighTiers.new(pals.uri)
      students_with_tiering_json = tiers.students_with_tiering_json([pals.shs.id], time_now)
      expect(students_with_tiering_json).to contain_exactly(*[{
        "id"=>pals.shs_freshman_mari.id,
        "grade"=>"9",
        "first_name"=>"Mari",
        "last_name"=>"Kenobi",
        "program_assigned"=>nil,
        "sped_placement"=>nil,
        "house"=>"Beacon",
        "student_section_assignments_right_now"=>[{
          "id"=>pals.shs_freshman_mari.student_section_assignments.first.id,
          "grade_numeric"=>"67.0",
          "grade_letter"=>"D",
          "section"=>{
            "id"=>pals.shs_tuesday_biology_section.id,
            "section_number"=>"SHS-BIO-TUES",
            "course_description"=>"BIOLOGY 1 HONORS"
          }
        }],
        "tier"=>{
          "level"=>0,
          "triggers"=>[],
          "data"=>{
            "course_failures"=>0,
            "course_ds"=>1,
            "recent_absence_rate"=>1.0,
            "recent_discipline_actions"=>0
          }
        },
        "notes"=>{
          "last_sst_note"=>{},
          "last_experience_note"=>{},
          "last_other_note"=>{}
        }
      }, {
          "id"=>pals.shs_freshman_amir.id,
          "grade"=>"9",
          "first_name"=>"Amir",
          "last_name"=>"Solo",
          "program_assigned"=>nil,
          "sped_placement"=>nil,
          "house"=>"Broadway",
          "student_section_assignments_right_now"=>[],
          "tier"=>{
            "level"=>0,
            "triggers"=>[],
            "data"=>{
              "course_failures"=>0,
              "course_ds"=>0,
              "recent_absence_rate"=>1.0,
              "recent_discipline_actions"=>0
            }
          },
          "notes"=>{
            "last_sst_note"=>{},
            "last_experience_note"=>{},
            "last_other_note"=>{}
          }
        }, {
          "id"=>pals.shs_senior_kylo.id,
          "grade"=>"12",
          "first_name"=>"Kylo",
          "last_name"=>"Ren",
          "program_assigned"=>nil,
          "sped_placement"=>nil,
          "house"=>"Broadway",
          "student_section_assignments_right_now"=>[{
            "id"=>pals.shs_senior_kylo.student_section_assignments.first.id,
            "grade_numeric"=>"61.0",
            "grade_letter"=>"F",
            "section"=>{
              "id"=>pals.shs_second_period_ceramics.id,
              "section_number"=>"ART-302A",
              "course_description"=>"ART MAJOR FOUNDATIONS"
            }
          }],
          "tier"=>{
            "level"=>0,
            "triggers"=>[],
            "data"=>{
              "course_failures"=>1,
              "course_ds"=>0,
              "recent_absence_rate"=>1.0,
              "recent_discipline_actions"=>0
            }
          },
          "notes"=>{
            "last_sst_note"=>{},
            "last_experience_note"=>{},
            "last_other_note"=>{}
          }
        }
      ])
    end
  end

  describe '#decide_tier' do
    def decide_tier_output(data)
      tiers = ExperimentalSomervilleHighTiers.new(pals.uri)
      tier = tiers.send(:decide_tier, data)
      [tier.level, tier.triggers]
    end

    it 'Level 0' do
      level = 0
      expect(decide_tier_output({
        course_ds: 0,
        course_failures: 0,
        recent_discipline_actions: 0,
        recent_absence_rate: 1.0
      })).to eq [level, []]
      expect(decide_tier_output({
        course_ds: 1,
        course_failures: 0,
        recent_discipline_actions: 0,
        recent_absence_rate: 1.0
      })).to eq [level, []]
      expect(decide_tier_output({
        course_ds: 1,
        course_failures: 0,
        recent_discipline_actions: 0,
        recent_absence_rate: 0.95
      })).to eq [level, []]
      expect(decide_tier_output({
        course_ds: 1,
        course_failures: 0,
        recent_discipline_actions: 4,
        recent_absence_rate: 1.0
      })).to eq [level, []]
      expect(decide_tier_output({
        course_ds: 0,
        course_failures: 1,
        recent_discipline_actions: 0,
        recent_absence_rate: 1.0
      })).to eq [level, []]
      expect(decide_tier_output({
        course_ds: 4,
        course_failures: 0,
        recent_discipline_actions: 0,
        recent_absence_rate: 1.0
      })).to eq [level, []]
    end

    it 'Level 1: 1 F and 2 Ds OR less than 95 attendance over last 45 days' do
      expect(decide_tier_output({
        course_ds: 2,
        course_failures: 1,
        recent_discipline_actions: 0,
        recent_absence_rate: 1.00
      })).to eq [1, [:academic]]
      expect(decide_tier_output({
        course_ds: 0,
        course_failures: 0,
        recent_discipline_actions: 0,
        recent_absence_rate: 0.94
      })).to eq [1, [:absence]]
      expect(decide_tier_output({
        course_ds: 2,
        course_failures: 1,
        recent_discipline_actions: 0,
        recent_absence_rate: 0.90
      })).to eq [1, [:academic, :absence]]
    end

    it "Level 2: 2 F's OR less than 90 attendance over last 45" do
      expect(decide_tier_output({
        course_ds: 0,
        course_failures: 2,
        recent_discipline_actions: 0,
        recent_absence_rate: 0.90
      })).to eq [2, [:academic]]
      expect(decide_tier_output({
        course_ds: 0,
        course_failures: 0,
        recent_discipline_actions: 0,
        recent_absence_rate: 0.89
      })).to eq [2, [:absence]]
      expect(decide_tier_output({
        course_ds: 0,
        course_failures: 2,
        recent_discipline_actions: 0,
        recent_absence_rate: 0.85
      })).to eq [2, [:academic, :absence]]
    end

    it "Level 3: 3 F's OR less than 85 attendance over last 45 OR 5-6 discipline actions over the last 45 school days" do
      expect(decide_tier_output({
        course_ds: 0,
        course_failures: 3,
        recent_discipline_actions: 0,
        recent_absence_rate: 1.0
      })).to eq [3, [:academic]]
      expect(decide_tier_output({
        course_ds: 0,
        course_failures: 0,
        recent_discipline_actions: 0,
        recent_absence_rate: 0.84
      })).to eq [3, [:absence]]
      expect(decide_tier_output({
        course_ds: 0,
        course_failures: 0,
        recent_discipline_actions: 5,
        recent_absence_rate: 1.0
      })).to eq [3, [:discipline]]
      expect(decide_tier_output({
        course_ds: 0,
        course_failures: 3,
        recent_discipline_actions: 5,
        recent_absence_rate: 0.80
      })).to eq [3, [:academic, :absence, :discipline]]
    end

    it "Level 4: At least 4 F's OR less than 80% attendance over last 45 school days OR 7 or more discipline actions over the last 45 school days" do
      expect(decide_tier_output({
        course_ds: 0,
        course_failures: 4,
        recent_discipline_actions: 0,
        recent_absence_rate: 1.0
      })).to eq [4, [:academic]]
      expect(decide_tier_output({
        course_ds: 0,
        course_failures: 0,
        recent_discipline_actions: 0,
        recent_absence_rate: 0.79
      })).to eq [4, [:absence]]
      expect(decide_tier_output({
        course_ds: 0,
        course_failures: 0,
        recent_discipline_actions: 7,
        recent_absence_rate: 1.0
      })).to eq [4, [:discipline]]
      expect(decide_tier_output({
        course_ds: 0,
        course_failures: 4,
        recent_discipline_actions: 7,
        recent_absence_rate: 0.79
      })).to eq [4, [:academic, :absence, :discipline]]
    end
  end

  describe '#current_term_local_ids' do
    it 'works at different times' do
      tiers = ExperimentalSomervilleHighTiers.new(pals.uri)
      expect(tiers.send(:current_term_local_ids, time_now)).to eq  ['Q3', 'S2', '2', '9', 'FY']
      expect(tiers.send(:current_term_local_ids, DateTime.new(2018, 10, 2))).to eq  ['Q1', 'S1', '1', '9', 'FY']
      expect(tiers.send(:current_term_local_ids, DateTime.new(2018, 11, 21))).to eq  ['Q2', 'S1', '1', '9', 'FY']
      expect(tiers.send(:current_term_local_ids, DateTime.new(2019, 6, 26))).to eq  []
    end
  end
end
