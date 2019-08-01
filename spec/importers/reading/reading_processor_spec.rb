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
      "grade": '2',
      local_id: '2',
      enrollment_status: 'Active'
    )
    Student.create!(
      first_name: 'Donald',
      last_name: 'Skywalker',
      school: pals.healey,
      "grade": '2',
      local_id: '3',
      enrollment_status: 'Active'
    )
  end

  describe 'integration test' do
    it 'works on happy path' do
      pals = TestPals.create!
      students = create_test_students(pals)
      processor = MegaReadingProcessor.new(pals.uri.id, header_rows_count: 2)
      reading_data = processor.process(fixture_file_text)
      puts reading_data

      expect(reading_data.size).to eq 2
      expect(reading_data[0].as_json(except: [:student_id, :imported_by_educator_id])).to eq([{"grade"=>"2", "assessment_period"=>"fall", "assessment_key"=>"dibels_nwf_cls", "data_point"=>"77"},
        {"grade"=>"2", "assessment_period"=>"fall", "assessment_key"=>"dibels_nwf_wwr", "data_point"=>"23"},
        {"grade"=>"2", "assessment_period"=>"fall", "assessment_key"=>"dibels_dorf_wrc", "data_point"=>"41"},
        {"grade"=>"2", "assessment_period"=>"fall", "assessment_key"=>"dibels_dorf_errors", "data_point"=>"6"},
        {"grade"=>"2", "assessment_period"=>"fall", "assessment_key"=>"dibels_dorf_acc", "data_point"=>"87%"},
        {"grade"=>"2", "assessment_period"=>"fall", "assessment_key"=>"growth_fall_winter", "data_point"=>"25orf 9acc."},
        {"grade"=>"2", "assessment_period"=>"fall", "assessment_key"=>"growth_f_and_p", "data_point"=>"1 level"},
        {"grade"=>"2", "assessment_period"=>"winter", "assessment_key"=>"dibels_dorf_wrc", "data_point"=>"41"},
        {"grade"=>"2", "assessment_period"=>"winter", "assessment_key"=>"dibels_dorf_errors", "data_point"=>"6"},
        {"grade"=>"2", "assessment_period"=>"winter", "assessment_key"=>"dibels_dorf_acc", "data_point"=>"87%"},
        {"grade"=>"2", "assessment_period"=>"winter", "assessment_key"=>"growth_f_and_p", "data_point"=>"1 level"},
        {"grade"=>"2", "assessment_period"=>"spring", "assessment_key"=>"dibels_dorf_wrc", "data_point"=>"41"},
        {"grade"=>"2", "assessment_period"=>"spring", "assessment_key"=>"dibels_dorf_errors", "data_point"=>"6"},
        {"grade"=>"2", "assessment_period"=>"spring", "assessment_key"=>"dibels_dorf_acc", "data_point"=>"87%"},
        {"grade"=>"2", "assessment_period"=>"spring", "assessment_key"=>"growth_f_and_p", "data_point"=>"1 level"},
        {"grade"=>"2", "assessment_period"=>"fall", "assessment_key"=>"dibels_nwf_cls", "data_point"=>"70"},
        {"grade"=>"2", "assessment_period"=>"fall", "assessment_key"=>"dibels_nwf_wwr", "data_point"=>"20"},
        {"grade"=>"2", "assessment_period"=>"fall", "assessment_key"=>"dibels_dorf_wrc", "data_point"=>"40"},
        {"grade"=>"2", "assessment_period"=>"fall", "assessment_key"=>"dibels_dorf_errors", "data_point"=>"5"},
        {"grade"=>"2", "assessment_period"=>"fall", "assessment_key"=>"dibels_dorf_acc", "data_point"=>"80%"},
        {"grade"=>"2", "assessment_period"=>"fall", "assessment_key"=>"growth_fall_winter", "data_point"=>"25orf 9acc."},
        {"grade"=>"2", "assessment_period"=>"fall", "assessment_key"=>"growth_f_and_p", "data_point"=>"2 levels"},
        {"grade"=>"2", "assessment_period"=>"winter", "assessment_key"=>"dibels_dorf_wrc", "data_point"=>"40"},
        {"grade"=>"2", "assessment_period"=>"winter", "assessment_key"=>"dibels_dorf_errors", "data_point"=>"5"},
        {"grade"=>"2", "assessment_period"=>"winter", "assessment_key"=>"dibels_dorf_acc", "data_point"=>"80%"},
        {"grade"=>"2", "assessment_period"=>"winter", "assessment_key"=>"growth_f_and_p", "data_point"=>"2 levels"},
        {"grade"=>"2", "assessment_period"=>"spring", "assessment_key"=>"dibels_dorf_wrc", "data_point"=>"40"},
        {"grade"=>"2", "assessment_period"=>"spring", "assessment_key"=>"dibels_dorf_errors", "data_point"=>"5"},
        {"grade"=>"2", "assessment_period"=>"spring", "assessment_key"=>"dibels_dorf_acc", "data_point"=>"80%"},
        {"grade"=>"2", "assessment_period"=>"spring", "assessment_key"=>"growth_f_and_p", "data_point"=>"2 levels"}])
    end
  end
end
