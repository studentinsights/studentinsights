require 'rails_helper'

RSpec.describe do

  describe '#import' do

    let(:import_class) {
      Class.new do
        include Importer
        def import_row(row); Student.where(local_id: row[:local_id]).first_or_create! end
        def remote_file_name; '' end
      end
    }

    context 'CSV with 1 Somerville High School student and 1 Healey student' do

      let(:fixture_path) { "#{Rails.root}/spec/fixtures/fake_students_export.txt" }
      let(:file) { File.open(fixture_path) }
      let(:transformer) { CsvTransformer.new }
      let(:csv) { transformer.transform(file) }

      context 'no scope' do
        let(:importer) { import_class.new }
        it 'imports both students' do
          expect { importer.import(csv) }.to change(Student, :count).by 2
        end
      end

      context 'scope is Healey School' do
        let(:healey_school) { FactoryGirl.create(:healey) }
        let(:importer) { import_class.new(school_scope: healey_school) }
        it 'only imports the Healey student' do
          expect { importer.import(csv) }.to change(Student, :count).by 1
        end
      end

    end
  end
end
