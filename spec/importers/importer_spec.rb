require 'rails_helper'

RSpec.describe Importer do

  describe '#connect_transform_import' do

    let(:log) { LogHelper::Redirect.instance.file }

    context 'CSV with 1 High School student, 1 Healey student (Elem), 1 Brown student (Elem)' do

      let(:fixture_path) { "#{Rails.root}/spec/fixtures/fake_students_export.txt" }
      let(:file) { File.read(fixture_path) }
      let(:mock_client) { double(:sftp_client, read_file: file) }

      context 'no scope' do
        let(:file_importer) { StudentsImporter.new }
        let(:importer) {
          Importer.new(
            file_importers: [file_importer],
            client: mock_client,
            log_destination: log
          )
        }

        it 'imports both students' do
          expect { importer.connect_transform_import }.to change(Student, :count).by 3
        end
      end

      context 'scope is Healey School' do
        let(:healey) { FactoryGirl.create(:healey) }
        let(:file_importer) { StudentsImporter.new }
        let(:importer) {
          Importer.new(
            school_scope: [healey.local_id],
            file_importers: [file_importer],
            client: mock_client,
            log_destination: log
          )
        }

        it 'only imports the Healey student' do
          expect { importer.connect_transform_import }.to change(Student, :count).by 1
        end
      end
    end

  end

end
