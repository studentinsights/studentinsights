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
    context 'students' do
      context 'given a csv' do
        let(:fixture_path) { "#{Rails.root}/spec/fixtures/fake_students_export.txt" }
        let(:file) { File.open(fixture_path) }
        let(:transformer) { CsvTransformer.new }
        let(:csv) { transformer.transform(file) }
        context 'not scoped to healey school' do
          let(:importer) { import_class.new }
          it 'imports two Somerville High School students' do
            expect { importer.import(csv) }.to change(Student, :count).by 2
          end
        end
        context 'scoped to healey school' do
          let(:healey_school) { FactoryGirl.create(:healey) }
          let(:importer) { import_class.new(school_scope: healey_school) }
          it 'does not import Somerville High School students' do
            expect { importer.import(csv) }.to change(Student, :count).by 0
          end
        end
      end
    end
  end
end
