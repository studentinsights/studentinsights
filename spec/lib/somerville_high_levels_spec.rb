require 'spec_helper'

RSpec.describe SomervilleHighLevels do
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe '#students_with_levels_json' do
    it 'works correctly' do
      FactoryBot.create(:event_note, {
        student: pals.shs_senior_kylo,
        event_note_type_id: 304,
        recorded_at: time_now - 4.days
      })
      FactoryBot.create(:event_note, {
        student: pals.shs_freshman_mari,
        event_note_type_id: 305,
        recorded_at: time_now - 6.days
      })
      levels = SomervilleHighLevels.new
      students_with_levels_json = levels.students_with_levels_json(pals.uri, [pals.shs.id], time_now)
      expect(students_with_levels_json).to contain_exactly(*[{
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
        "level"=>{
          "level_number"=>0,
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
          "last_experience_note"=>{
            "event_note_type_id"=>305,
            "recorded_at"=>"2018-03-07T11:03:00.000Z"
          },
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
          "level"=>{
            "level_number"=>0,
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
          "level"=>{
            "level_number"=>0,
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
            "last_other_note"=>{
              "event_note_type_id"=>304,
              "recorded_at"=>"2018-03-09T11:03:00.000Z"
            }
          }
        }
      ])
    end
  end

  describe '#current_term_local_ids' do
    it 'works at different times' do
      levels = SomervilleHighLevels.new
      expect(levels.send(:current_term_local_ids, time_now)).to eq  ['Q3', 'S2', '2', '9', 'FY']
      expect(levels.send(:current_term_local_ids, DateTime.new(2018, 10, 2))).to eq  ['Q1', 'S1', '1', '9', 'FY']
      expect(levels.send(:current_term_local_ids, DateTime.new(2018, 11, 21))).to eq  ['Q2', 'S1', '1', '9', 'FY']
      expect(levels.send(:current_term_local_ids, DateTime.new(2019, 6, 26))).to eq  []
    end
  end
end
