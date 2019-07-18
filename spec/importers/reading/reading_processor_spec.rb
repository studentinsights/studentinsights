require 'rails_helper'

RSpec.describe MegaReadingProcessor do
  def fixture_file_text
    IO.read("#{Rails.root}/spec/importers/reading/reading_processor.csv")
  end

  def create_test_students(pals)
    Student.create!(
      first_name: 'Pluto',
      last_name: 'Skywalker',
      school: pals.healey,
      grade: '2',
      local_id: '2',
      enrollment_status: 'Active'
    )
    Student.create!(
      first_name: 'Donald',
      last_name: 'Skywalker',
      school: pals.healey,
      grade: '2',
      local_id: '3',
      enrollment_status: 'Active'
    )
  end

  describe 'integration test' do
    it 'works on happy path' do
      pals = TestPals.create!
      students = create_test_students(pals)
      importer = MegaReadingProcessor.new(pals.uri.id, header_rows_count: 2)
      reading_data = importer.process(fixture_file_text)
      puts reading_data

      expect(reading_data.size).to eq 2
      expect(reading_data[0]).to eq([{:student_id=>6, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:fall, :assessment_key=>:dibels_nwf_cls, :data_point=>"77"},
        {:student_id=>6, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:fall, :assessment_key=>:dibels_nwf_wwr, :data_point=>"23"},
        {:student_id=>6, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:fall, :assessment_key=>:dibels_dorf_wrc, :data_point=>"41"},
        {:student_id=>6, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:fall, :assessment_key=>:dibels_dorf_errors, :data_point=>"6"},
        {:student_id=>6, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:fall, :assessment_key=>:dibels_dorf_acc, :data_point=>"87%"},
        {:student_id=>6, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:fall, :assessment_key=>:growth_fall_winter, :data_point=>"25orf 9acc."},
        {:student_id=>6, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:fall, :assessment_key=>:growth_f_and_p, :data_point=>"1 level"},
        {:student_id=>6, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:winter, :assessment_key=>:dibels_dorf_wrc, :data_point=>"41"},
        {:student_id=>6, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:winter, :assessment_key=>:dibels_dorf_errors, :data_point=>"6"},
        {:student_id=>6, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:winter, :assessment_key=>:dibels_dorf_acc, :data_point=>"87%"},
        {:student_id=>6, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:winter, :assessment_key=>:growth_f_and_p, :data_point=>"1 level"},
        {:student_id=>6, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:spring, :assessment_key=>:dibels_dorf_wrc, :data_point=>"41"},
        {:student_id=>6, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:spring, :assessment_key=>:dibels_dorf_errors, :data_point=>"6"},
        {:student_id=>6, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:spring, :assessment_key=>:dibels_dorf_acc, :data_point=>"87%"},
        {:student_id=>6, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:spring, :assessment_key=>:growth_f_and_p, :data_point=>"1 level"},
        {:student_id=>7, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:fall, :assessment_key=>:dibels_nwf_cls, :data_point=>"70"},
        {:student_id=>7, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:fall, :assessment_key=>:dibels_nwf_wwr, :data_point=>"20"},
        {:student_id=>7, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:fall, :assessment_key=>:dibels_dorf_wrc, :data_point=>"40"},
        {:student_id=>7, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:fall, :assessment_key=>:dibels_dorf_errors, :data_point=>"5"},
        {:student_id=>7, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:fall, :assessment_key=>:dibels_dorf_acc, :data_point=>"80%"},
        {:student_id=>7, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:fall, :assessment_key=>:growth_fall_winter, :data_point=>"25orf 9acc."},
        {:student_id=>7, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:fall, :assessment_key=>:growth_f_and_p, :data_point=>"2 levels"},
        {:student_id=>7, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:winter, :assessment_key=>:dibels_dorf_wrc, :data_point=>"40"},
        {:student_id=>7, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:winter, :assessment_key=>:dibels_dorf_errors, :data_point=>"5"},
        {:student_id=>7, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:winter, :assessment_key=>:dibels_dorf_acc, :data_point=>"80%"},
        {:student_id=>7, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:winter, :assessment_key=>:growth_f_and_p, :data_point=>"2 levels"},
        {:student_id=>7, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:spring, :assessment_key=>:dibels_dorf_wrc, :data_point=>"40"},
        {:student_id=>7, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:spring, :assessment_key=>:dibels_dorf_errors, :data_point=>"5"},
        {:student_id=>7, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:spring, :assessment_key=>:dibels_dorf_acc, :data_point=>"80%"},
        {:student_id=>7, :imported_by_educator_id=>999999, :grade=>"2", :assessment_period=>:spring, :assessment_key=>:growth_f_and_p, :data_point=>"2 levels"}])
    end
  end
end