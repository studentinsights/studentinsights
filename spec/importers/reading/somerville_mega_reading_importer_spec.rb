require 'rails_helper'

RSpec.describe SomervilleMegaReadingImporter do
  let!(:pals) { TestPals.create! }

  def fixture_file_location
    "#{Rails.root}/spec/importers/reading/reading_fixture_csvs/"
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

  describe 'import events' do
    it 'imports all records in csv' do
      pluto, donald = create_students!
      ENV['READING_IMPORTER_UPLOADED_BY_EDUCATOR_LOGIN_NAME'] = "uri"
      importer = SomervilleMegaReadingImporter.new(pals.uri.id, files_path: fixture_file_location)
      importer.import
      reading_data = ReadingBenchmarkDataPoint.all
      expect(reading_data.as_json(except: [:created_at, :updated_at])).to contain_exactly(*[
        {"id" => 1,"student_id" => pluto.id,"benchmark_school_year" => 2019,"benchmark_period_key" => "fall","benchmark_assessment_key" => "dibels_lnf","json" => "1","educator_id" => 999999},
        {"id" => 2,"student_id" => pluto.id,"benchmark_school_year" => 2019,"benchmark_period_key" => "winter","benchmark_assessment_key" => "dibels_fsf","json" => "25","educator_id" => 999999},
        {"id" => 3,"student_id" => pluto.id,"benchmark_school_year" => 2019,"benchmark_period_key" => "winter","benchmark_assessment_key" => "dibels_lnf","json" => "18","educator_id" => 999999},
        {"id" => 4,"student_id" => pluto.id,"benchmark_school_year" => 2019,"benchmark_period_key" => "winter","benchmark_assessment_key" => "dibels_psf","json" => "9","educator_id" => 999999},
        {"id" => 5,"student_id" => pluto.id,"benchmark_school_year" => 2019,"benchmark_period_key" => "winter","benchmark_assessment_key" => "f_and_p_english","json" => "AA","educator_id" => 999999},
        {"id" => 6,"student_id" => pluto.id,"benchmark_school_year" => 2019,"benchmark_period_key" => "winter","benchmark_assessment_key" => "f_and_p_spanish","json" => "AA","educator_id" => 999999},
        {"id" => 7,"student_id" => pluto.id,"benchmark_school_year" => 2019,"benchmark_period_key" => "spring","benchmark_assessment_key" => "dibels_lnf","json" => "35","educator_id" => 999999},
        {"id" => 8,"student_id" => pluto.id,"benchmark_school_year" => 2019,"benchmark_period_key" => "spring","benchmark_assessment_key" => "dibels_psf","json" => "28","educator_id" => 999999},
        {"id" => 9,"student_id" => pluto.id,"benchmark_school_year" => 2019,"benchmark_period_key" => "spring","benchmark_assessment_key" => "dibels_nwf_cls","json" => "25","educator_id" => 999999},
        {"id" => 10,"student_id" => pluto.id,"benchmark_school_year" => 2019,"benchmark_period_key" => "spring","benchmark_assessment_key" => "dibels_nwf_wwr","json" => "0","educator_id" => 999999},
        {"id" => 11,"student_id" => pluto.id,"benchmark_school_year" => 2019,"benchmark_period_key" => "spring","benchmark_assessment_key" => "f_and_p_english","json" => "AA","educator_id" => 999999,},
        {"id" => 12,"student_id" => pluto.id,"benchmark_school_year" => 2019,"benchmark_period_key" => "spring","benchmark_assessment_key" => "f_and_p_spanish","json" => "AA","educator_id" => 999999,},
        {"id" => 13,"student_id" => pluto.id,"benchmark_school_year" => 2019,"benchmark_period_key" => "spring","benchmark_assessment_key" => "las_links_speaking","json" => "1","educator_id" => 999999},
        {"id" => 14,"student_id" => pluto.id,"benchmark_school_year" => 2019,"benchmark_period_key" => "spring","benchmark_assessment_key" => "las_links_listening","json" => "1","educator_id" => 999999},
        {"id" => 15,"student_id" => 7,"benchmark_school_year" => 2019,"benchmark_period_key" => "fall","benchmark_assessment_key" => "dibels_lnf","json" => "5","educator_id" => 999999},
        {"id" => 16,"student_id" => 7,"benchmark_school_year" => 2019,"benchmark_period_key" => "winter","benchmark_assessment_key" => "dibels_fsf","json" => "26","educator_id" => 999999},
        {"id" => 17,"student_id" => 7,"benchmark_school_year" => 2019,"benchmark_period_key" => "winter","benchmark_assessment_key" => "dibels_lnf","json" => "19","educator_id" => 999999},
        {"id" => 18,"student_id" => 7,"benchmark_school_year" => 2019,"benchmark_period_key" => "winter","benchmark_assessment_key" => "dibels_psf","json" => "10","educator_id" => 999999},
        {"id" => 19,"student_id" => 7,"benchmark_school_year" => 2019,"benchmark_period_key" => "winter","benchmark_assessment_key" => "f_and_p_english","json" => "A","educator_id" => 999999},
        {"id" => 20,"student_id" => 7,"benchmark_school_year" => 2019,"benchmark_period_key" => "winter","benchmark_assessment_key" => "f_and_p_spanish","json" => "A","educator_id" => 999999,},
        {"id" => 21,"student_id" => 7,"benchmark_school_year" => 2019,"benchmark_period_key" => "spring","benchmark_assessment_key" => "dibels_lnf","json" => "36","educator_id" => 999999},
        {"id" => 22,"student_id" => 7,"benchmark_school_year" => 2019,"benchmark_period_key" => "spring","benchmark_assessment_key" => "dibels_psf","json" => "29","educator_id" => 999999},
        {"id" => 23,"student_id" => 7,"benchmark_school_year" => 2019,"benchmark_period_key" => "spring","benchmark_assessment_key" => "dibels_nwf_cls","json" => "26","educator_id" => 999999},
        {"id" => 24,"student_id" => 7,"benchmark_school_year" => 2019,"benchmark_period_key" => "spring","benchmark_assessment_key" => "dibels_nwf_wwr","json" => "1","educator_id" => 999999},
        {"id" => 25,"student_id" => 7,"benchmark_school_year" => 2019,"benchmark_period_key" => "spring","benchmark_assessment_key" => "f_and_p_english","json" => "A","educator_id" => 999999},
        {"id" => 26,"student_id" => 7,"benchmark_school_year" => 2019,"benchmark_period_key" => "spring","benchmark_assessment_key" => "f_and_p_spanish","json" => "A","educator_id" => 999999},
        {"id" => 27,"student_id" => 7,"benchmark_school_year" => 2019,"benchmark_period_key" => "spring","benchmark_assessment_key" => "las_links_speaking","json" => "2","educator_id" => 999999},
        {"id" => 28,"student_id" => 7,"benchmark_school_year" => 2019,"benchmark_period_key" => "spring","benchmark_assessment_key" => "las_links_listening","json" => "2","educator_id" => 999999}])
    end
  end


end
