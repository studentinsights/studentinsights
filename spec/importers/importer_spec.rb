require 'rails_helper'

RSpec.describe do

  describe '#import' do

    let(:file_importer_class) {
      Class.new do
        def import_row(row); Student.where(local_id: row[:local_id]).first_or_create! end
        def remote_file_name; '' end
      end
    }

    let(:file_importer) { file_importer_class.new }

    context 'CSV with 1 High School student, 1 Healey student (Elem), 1 Brown student (Elem)' do

      let(:fixture_path) { "#{Rails.root}/spec/fixtures/fake_students_export.txt" }
      let(:file) { File.open(fixture_path) }
      let(:transformer) { CsvTransformer.new }
      let(:csv) { transformer.transform(file) }

      context 'no scope' do
        let(:importer) { Importer.new(current_file_importer: file_importer) }
        it 'imports both students' do
          expect { importer.start_import(csv) }.to change(Student, :count).by 3
        end
      end

      context 'scope is Healey School' do
        let(:healey) { FactoryGirl.create(:healey) }
        let(:importer) { Importer.new(
            school_scope: [healey.local_id], current_file_importer: file_importer
          )
        }
        it 'only imports the Healey student' do
          expect { importer.start_import(csv) }.to change(Student, :count).by 1
        end
      end

      context 'scope is elementary schools' do
        let!(:healey) { FactoryGirl.create(:healey) }
        let(:importer) { Importer.new(
            school_scope: ['ELEM'], current_file_importer: file_importer
          )
        }
        it 'only imports the Healey student' do
          expect { importer.start_import(csv) }.to change(Student, :count).by 2
        end
      end

    end
  end
end
