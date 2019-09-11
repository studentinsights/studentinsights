require 'rails_helper'

RSpec.describe MegaReadingProcessor do
  let!(:pals) { TestPals.create! }

  def fixture_file_text
    IO.read("#{Rails.root}/spec/importers/reading/reading_fixture_csvs/mega_reading_processor_fixture.csv")
  end

  def create_students!
    pluto = Student.create!(
      first_name: 'Pluto',
      last_name: 'Skywalker', # even if name in file doesn't exactly match insights
      school: pals.healey,
      grade: 'KF',
      local_id: '1111119992',
      enrollment_status: 'Active'
    )
    donald = Student.create!(
      first_name: 'Donald',
      last_name: 'Skywalker',
      school: pals.healey,
      grade: 'KF',
      local_id: '1111119993',
      enrollment_status: 'Active'
    )
    [pluto, donald]
  end

  describe 'integration test' do
    it 'works on happy path' do
      pluto, donald = create_students!
      processor = MegaReadingProcessor.new
      ENV['READING_IMPORTER_UPLOADED_BY_EDUCATOR_LOGIN_NAME'] = pals.uri.login_name
      rows, stats = processor.process(fixture_file_text)
      expect(rows.size).to eq 28
      expect(rows.as_json).to contain_exactly(*[
        {"imported_by_educator_id" => pals.uri.id, "student_id" => pluto.id, "grade"=>"KF", "assessment_period"=>"fall", "assessment_key"=>"dibels_lnf", "data_point"=>"1"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => pluto.id, "grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"dibels_fsf", "data_point"=>"25"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => pluto.id, "grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"dibels_lnf", "data_point"=>"18"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => pluto.id, "grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"dibels_psf", "data_point"=>"9"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => pluto.id, "grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"f_and_p_english", "data_point"=>"AA"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => pluto.id, "grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"f_and_p_spanish", "data_point"=>"AA"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => pluto.id, "grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"dibels_lnf", "data_point"=>"35"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => pluto.id, "grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"dibels_psf", "data_point"=>"28"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => pluto.id, "grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"dibels_nwf_cls", "data_point"=>"25"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => pluto.id, "grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"dibels_nwf_wwr", "data_point"=>"0"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => pluto.id, "grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"f_and_p_english", "data_point"=>"AA"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => pluto.id, "grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"f_and_p_spanish", "data_point"=>"AA"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => pluto.id, "grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"las_links_speaking", "data_point"=>"1"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => pluto.id, "grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"las_links_listening", "data_point"=>"1"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => donald.id, "grade"=>"KF", "assessment_period"=>"fall", "assessment_key"=>"dibels_lnf", "data_point"=>"5"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => donald.id, "grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"dibels_fsf", "data_point"=>"26"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => donald.id, "grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"dibels_lnf", "data_point"=>"19"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => donald.id, "grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"dibels_psf", "data_point"=>"10"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => donald.id, "grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"f_and_p_english", "data_point"=>"A"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => donald.id, "grade"=>"KF", "assessment_period"=>"winter", "assessment_key"=>"f_and_p_spanish", "data_point"=>"A"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => donald.id, "grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"dibels_lnf", "data_point"=>"36"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => donald.id, "grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"dibels_psf", "data_point"=>"29"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => donald.id, "grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"dibels_nwf_cls", "data_point"=>"26"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => donald.id, "grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"dibels_nwf_wwr", "data_point"=>"1"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => donald.id, "grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"f_and_p_english", "data_point"=>"A"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => donald.id, "grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"f_and_p_spanish", "data_point"=>"A"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => donald.id, "grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"las_links_speaking", "data_point"=>"2"},
        {"imported_by_educator_id" => pals.uri.id, "student_id" => donald.id, "grade"=>"KF", "assessment_period"=>"spring", "assessment_key"=>"las_links_listening", "data_point"=>"2"}
      ])
      expect(stats).to eq({
        :valid_data_points => 28,
        :valid_student_name => 2,
        :invalid_student_name_count => 0,
        :invalid_student_names_list_size => 0,
        :missing_data_point_because_student_moved_school => 0,
        :blank_data_points_count => 6
      })
    end
  end
end
