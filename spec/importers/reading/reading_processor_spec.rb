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
      processor = MegaReadingProcessor.new(pals.uri.id, header_rows_count: 3)
      reading_data = processor.process(fixture_file_text)
      puts reading_data[0].as_json(except: [:student_id, :imported_by_educator_id])

      expect(reading_data.size).to eq 2
      expect(reading_data[0].as_json(except: [:student_id, :imported_by_educator_id])).to eq([
        {"grade"=>"KF", "assessment_period"=>"fall", "assessment_key"=>"dibels_lnf", "data_point"=>"1"},
        {"grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"dibels_fsf", "data_point"=>"25"},
        {"grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"dibels_lnf", "data_point"=>"18"},
        {"grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"dibels_psf", "data_point"=>"9"},
        {"grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"f_and_p_english", "data_point"=>"AA"},
        {"grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"f_and_p_spanish", "data_point"=>"AA"},
        {"grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"dibels_lnf", "data_point"=>"35"},
        {"grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"dibels_psf", "data_point"=>"28"},
        {"grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"dibels_nwf_cls", "data_point"=>"25"},
        {"grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"dibels_nwf_wwr", "data_point"=>"0"},
        {"grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"f_and_p_english", "data_point"=>"AA"},
        {"grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"f_and_p_spanish", "data_point"=>"AA"},
        {"grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"las_links_speaking", "data_point"=>"1"},
        {"grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"las_links_listening", "data_point"=>"1"},
        {"grade"=>"KF", "assessment_period"=>"fall", "assessment_key"=>"dibels_lnf", "data_point"=>"5"},
        {"grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"dibels_fsf", "data_point"=>"26"},
        {"grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"dibels_lnf", "data_point"=>"19"},
        {"grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"dibels_psf", "data_point"=>"10"},
        {"grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"f_and_p_english", "data_point"=>"A"},
        {"grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"f_and_p_spanish", "data_point"=>"A"},
        {"grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"dibels_lnf", "data_point"=>"36"},
        {"grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"dibels_psf", "data_point"=>"29"},
        {"grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"dibels_nwf_cls", "data_point"=>"26"},
        {"grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"dibels_nwf_wwr", "data_point"=>"1"},
        {"grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"f_and_p_english", "data_point"=>"A"},
        {"grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"f_and_p_spanish", "data_point"=>"A"},
        {"grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"las_links_speaking", "data_point"=>"2"},
        {"grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"las_links_listening", "data_point"=>"2"}])
    end
  end
end
