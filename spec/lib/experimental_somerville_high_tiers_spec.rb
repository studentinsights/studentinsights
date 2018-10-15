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
        "limited_english_proficiency"=>nil,
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
          "limited_english_proficiency"=>nil,
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
          "limited_english_proficiency"=>nil,
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
