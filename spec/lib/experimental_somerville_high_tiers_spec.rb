require 'spec_helper'

RSpec.describe ExperimentalSomervilleHighTiers do
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe '#students_with_tiering_json' do
    it 'works correctly' do
      time_now = Time.now
      tiers = ExperimentalSomervilleHighTiers.new(pals.uri)
      students_with_tiering_json = tiers.students_with_tiering_json([pals.shs.id], time_now)
      expect(students_with_tiering_json).to eq [
        {
          "id"=>pals.shs_freshman_mari.id,
          "grade"=>"9",
          "first_name"=>"Mari",
          "last_name"=>"Kenobi",
          "program_assigned"=>nil,
          "sped_placement"=>nil,
          "house"=>"Beacon",
          "student_section_assignments"=>[{
            "id"=>pals.shs_freshman_mari.student_section_assignments.first.id,
            "grade_numeric"=>67.0,
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
        },
        {
          "id"=>pals.shs_freshman_amir.id,
          "grade"=>"9",
          "first_name"=>"Amir",
          "last_name"=>"Solo",
          "program_assigned"=>nil,
          "sped_placement"=>nil,
          "house"=>"Elm",
          "student_section_assignments"=>[{
            "id"=>pals.shs_freshman_amir.student_section_assignments.first.id,
            "grade_numeric"=>84.0,
            "grade_letter"=>"B",
            "section"=>{
              "id"=>pals.shs_third_period_physics.id,
              "section_number"=>"SCI-201A",
              "course_description"=>"PHYSICS 1"
            }
          }],
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
        }
      ]

      # "id"=>pals.shs_freshman_mari.id,
      #   "grade"=>"9",
      #   "first_name"=>"Mari",
      #   "last_name"=>"Kenobi",
      #   "program_assigned"=>nil,
      #   "sped_placement"=>nil,
      #   "house"=>"Beacon",
      #   "student_section_assignments"=>[{
      #     "id"=>pals.shs_freshman_mari.student_section_assignments.first.id,
      #     "grade_numeric"=>67.0,
      #     "grade_letter"=>"D",
      #     "section"=> {
      #       "id"=>pals.shs_tuesday_biology_section.id,
      #       "section_number"=>"SHS-BIO-TUES",
      #       "course_description"=>"BIOLOGY 1 HONORS"
      #     }
      #   }],
      #   :tier=>{
      #     "level"=>0,
      #     "triggers"=>[],
      #     "data"=>{
      #       "course_failures"=>0,
      #       "course_ds"=>1,
      #       "recent_absence_rate"=>1.0,
      #       "recent_discipline_actions"=>0
      #     }
      #   },
      #   :notes=>{
      #     :last_sst_note=>{},
      #     :last_experience_note=>{},
      #     :last_other_note=>{}
      #   }
      # }]
    end
  end
end
