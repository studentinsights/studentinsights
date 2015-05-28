require 'rails_helper'

RSpec.describe do

  let!(:x2_importing_class) {
    Class.new do
      include X2Importer
      def export_file_name() 'file.txt' end
      def import_row(row)
        Student.where(state_id: row[:state_id]).first_or_create!
      end
    end
  }

  describe '#connect_to_x2_and_import' do
    let(:x2_importer) { x2_importing_class.new }
    context 'sftp information present' do
      it 'does not raise an error' do
        allow(ENV).to receive(:[]).with('SIS_SFTP_HOST').and_return "sftp-site@site.com"
        allow(ENV).to receive(:[]).with('SIS_SFTP_USER').and_return "sftp-user"
        allow(ENV).to receive(:[]).with('SIS_SFTP_KEY').and_return "sftp-key"
        allow(Net::SFTP).to receive_messages(start: 'connection established')
        expect { x2_importer.connect_to_x2_and_import }.not_to raise_error
      end
    end
    context 'sftp information missing' do
      it 'raises an error' do
        expect { x2_importer.connect_to_x2_and_import }.to raise_error "SFTP information missing"
      end
    end
  end
  describe '#import' do
    context 'with good data' do
      let(:file) { File.open("#{Rails.root}/spec/fixtures/fake_students_export.txt") }
      context 'not scoped to healey school' do
        let(:x2_importer) { x2_importing_class.new }
        it 'returns a csv' do
          expect(x2_importer.import(file)).to be_a CSV
        end
        it 'sets the headers correctly' do
          headers = x2_importer.import(file).headers
          expect(headers).to eq [ :state_id, :full_name, :home_language, :grade, :homeroom, :school_local_id ]
        end
        it 'imports two Somerville High School students' do
          expect { x2_importer.import(file) }.to change(Student, :count).by 2
        end
      end
      context 'scoped to healey school' do
        let(:healey_school) { FactoryGirl.create(:healey) }
        let(:x2_importer) { x2_importing_class.new(school: healey_school) }
        it 'does not import Somerville High School students' do
          expect { x2_importer.import(file) }.to change(Student, :count).by 0
        end
      end
    end
  end
end
