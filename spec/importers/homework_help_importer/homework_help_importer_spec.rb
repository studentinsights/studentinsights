require 'rails_helper'

RSpec.describe HomeworkHelpImporter do
  def fixture_file_text
    IO.read("#{Rails.root}/spec/importers/homework_help_importer/homework_help_fixture.csv")
  end

  describe 'integration test' do
    let!(:pals) { TestPals.create! }
    let!(:history) { Course.create!(school: pals.shs, course_number: '111', course_description: 'US HISTORY 1 HONORS') }
    let!(:algebra) { Course.create!(school: pals.shs, course_number: '212', course_description: 'ALGEBRA 1 CP') }
    let!(:english) { Course.create!(school: pals.shs, course_number: '011', course_description: 'ENGLISH 1 HONORS') }
    let!(:geometry) { Course.create!(school: pals.shs, course_number: '221', course_description: 'GEOMETRY HONORS') }

    it 'works for importing notes' do
      log = LogHelper::FakeLog.new
      importer = HomeworkHelpImporter.new(log: log)
      rows = importer.import(fixture_file_text)
      expect(rows).to contain_exactly(*[{
        student_id: pals.shs_freshman_mari.id,
        form_timestamp: Time.parse('Tue, 25 Sep 2018 13:41:43.000000000 +0000'),
        course_ids: [history.id, algebra.id]
      }, {
        student_id: pals.shs_freshman_amir.id,
        form_timestamp: Time.parse('Mon, 01 Oct 2018 13:25:23.000000000 +0000'),
        course_ids: [english.id, history.id, algebra.id]
      }, {
        student_id: pals.shs_senior_kylo.id,
        form_timestamp: Time.parse('Mon, 01 Oct 2018 13:45:12.000000000 +0000'),
        course_ids: [geometry.id]
      }])
      expect(log.output).to include('valid_rows_count=>3')
    end
  end
end
