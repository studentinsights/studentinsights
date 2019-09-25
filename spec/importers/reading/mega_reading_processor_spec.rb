require 'rails_helper'

RSpec.describe MegaReadingProcessor do
  let!(:pals) { TestPals.create! }

  def fixture_file_text
    IO.read("#{Rails.root}/spec/importers/reading/mega_reading_processor_fixture.csv")
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
      processor = MegaReadingProcessor.new(pals.uri.id, 2018, include_benchmark_grade: true)
      rows, stats = processor.process(fixture_file_text)
      expect(rows.size).to eq 28

      expect(rows.as_json).to contain_exactly(*[
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => pluto.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"fall", "benchmark_assessment_key"=>"dibels_lnf", "json"=>{"value" => "1" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => pluto.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"winter", "benchmark_assessment_key"=>"dibels_fsf", "json"=>{"value" => "25" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => pluto.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"winter", "benchmark_assessment_key"=>"dibels_lnf", "json"=>{"value" => "18" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => pluto.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"winter", "benchmark_assessment_key"=>"dibels_psf", "json"=>{"value" => "9" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => pluto.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"winter", "benchmark_assessment_key"=>"f_and_p_english", "json"=>{"value" => "AA" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => pluto.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"winter", "benchmark_assessment_key"=>"f_and_p_spanish", "json"=>{"value" => "AA" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => pluto.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"spring", "benchmark_assessment_key"=>"dibels_lnf", "json"=>{"value" => "35" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => pluto.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"spring", "benchmark_assessment_key"=>"dibels_psf", "json"=>{"value" => "28" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => pluto.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"spring", "benchmark_assessment_key"=>"dibels_nwf_cls", "json"=>{"value" => "25" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => pluto.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"spring", "benchmark_assessment_key"=>"dibels_nwf_wwr", "json"=>{"value" => "0" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => pluto.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"spring", "benchmark_assessment_key"=>"f_and_p_english", "json"=>{"value" => "AA" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => pluto.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"spring", "benchmark_assessment_key"=>"f_and_p_spanish", "json"=>{"value" => "AA" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => pluto.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"spring", "benchmark_assessment_key"=>"las_links_speaking", "json"=>{"value" => "1" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => pluto.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"spring", "benchmark_assessment_key"=>"las_links_listening", "json"=>{"value" => "1" }},

        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => donald.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"fall", "benchmark_assessment_key"=>"dibels_lnf", "json"=>{"value" => "5" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => donald.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"winter", "benchmark_assessment_key"=>"dibels_fsf", "json"=>{"value" => "26" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => donald.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"winter", "benchmark_assessment_key"=>"dibels_lnf", "json"=>{"value" => "19" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => donald.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"winter", "benchmark_assessment_key"=>"dibels_psf", "json"=>{"value" => "10" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => donald.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"winter", "benchmark_assessment_key"=>"f_and_p_english", "json"=>{"value" => "A" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => donald.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"winter", "benchmark_assessment_key"=>"f_and_p_spanish", "json"=>{"value" => "A" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => donald.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"spring", "benchmark_assessment_key"=>"dibels_lnf", "json"=>{"value" => "36" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => donald.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"spring", "benchmark_assessment_key"=>"dibels_psf", "json"=>{"value" => "29" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => donald.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"spring", "benchmark_assessment_key"=>"dibels_nwf_cls", "json"=>{"value" => "26" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => donald.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"spring", "benchmark_assessment_key"=>"dibels_nwf_wwr", "json"=>{"value" => "1" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => donald.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"spring", "benchmark_assessment_key"=>"f_and_p_english", "json"=>{"value" => "A" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => donald.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"spring", "benchmark_assessment_key"=>"f_and_p_spanish", "json"=>{"value" => "A" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => donald.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"spring", "benchmark_assessment_key"=>"las_links_speaking", "json"=>{"value" => "2" }},
        {"educator_id" => pals.uri.id, "benchmark_school_year" => 2018, "student_id" => donald.id, "benchmark_grade"=>"KF", "benchmark_period_key"=>"spring", "benchmark_assessment_key"=>"las_links_listening", "json"=>{"value" => "2" }}
      ])
      expect(stats).to eq({
        :valid_data_points_count => 28,
        :valid_student_names_count => 2,
        :blank_student_name_count => 0,
        :invalid_student_name_count => 0,
        :invalid_student_names_list_size => 0,
        :missing_data_point_because_student_moved_school => 0,
        :blank_data_points_count => 6,
        :matcher => {
          :valid_rows_count=>28,
          :invalid_rows_count=>0,
          :invalid_student_local_ids=>[],
          :invalid_educator_emails_size=>0,
          :invalid_educator_last_names_size=>0,
          :invalid_educator_logins_size=>0,
          :invalid_course_numbers=>[],
          :invalid_sep_oids=>[]
        }
      })
    end
  end

  describe 'private #all_import_tuples' do
    it 'defines as expected, with spec guarding against accidental change' do
      processor = MegaReadingProcessor.new(pals.uri.id, 2018)
      tuples = processor.send(:all_import_tuples)
      expect(tuples.map {|t| t[0]}.uniq).to contain_exactly("KF","1","2","3","4","5")
      expect(tuples.map {|t| t[1]}.uniq).to contain_exactly(:fall, :winter, :spring)
      expect(tuples.map {|t| t[2]}.uniq).to contain_exactly(*[
        :dibels_fsf,
        :dibels_lnf,
        :instructional_needs,
        :dibels_psf,
        :f_and_p_english,
        :f_and_p_spanish,
        :dibels_nwf_cls,
        :dibels_nwf_wwr,
        :las_links_speaking,
        :las_links_listening,
        :dibels_dorf_wpm,
        :dibels_dorf_acc,
        :dibels_dorf_errors,
        :las_links_reading,
        :las_links_writing,
        :las_links_overall
      ])
      expect(tuples.map {|t| t[3].split(' / ').last }.uniq).to contain_exactly(*[
        "FSF",
        "LNF",
        "PSF",
        "Instructional needs",
        "F&P Level English",
        "F&P Level Spanish",
        "NWF CLS",
        "NWF WWR",
        "DORF ACC",
        "DORF Errors",
        "DORF WPM",
        "LAS Links Listening",
        "LAS Links Writing",
        "LAS Links Overall",
        "LAS Links Reading",
        "LAS Links Speaking"
      ])
    end
  end

  describe '#transform_data_point' do
    it 'works for dibels_dorf_acc to chomp percent suffix' do
      student = Student.create!(
        school: pals.healey,
        first_name: 'Pluto',
        last_name: 'Skywalker',
        grade: '1',
        local_id: '1111119992',
        enrollment_status: 'Active'
      )
      processor = MegaReadingProcessor.new(pals.uri.id, 2018, skip_explanation_rows_count: 0)
      rows, _ = processor.process([
        'student_local_id,student_last_names_first_names,1 / WINTER / DORF ACC',
        '1111119992,"Skywalker, Pluto",79%'
      ].join("\n"))
      expect(rows.size).to eq 1
      expect(rows.as_json).to contain_exactly(*[{
        "educator_id" => pals.uri.id,
        "benchmark_school_year" => 2018,
        "student_id" => student.id,
        "benchmark_period_key"=>"winter",
        "benchmark_assessment_key"=>"dibels_dorf_acc",
        "json"=>{"value" => "79" }
      }])
    end
  end
end
