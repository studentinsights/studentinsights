require 'rails_helper'
load File.expand_path('../../../../lib/tasks/import.thor', __FILE__)

RSpec.describe Import do
  let(:task) { Import::Start.new }

  describe '.start' do
    before do
      allow(SftpClient).to receive_messages(for_x2: sftp_client_double, for_star: sftp_client_double)
    end

    let(:fake_data) { File.open("#{Rails.root}/spec/fixtures/fake_x2_assessments.csv") }
    let(:sftp_client_double) { double(download_file: fake_data) }
    let(:commands) { Import::Start.start(%w[--test-mode]) }

    it 'invokes all the commands and returns the correct kind of values' do
      expect(commands[1]).to be_a ImportRecord
      expect(commands[2]).to eq nil
      expect(commands[3]).to eq ['HEA', 'WSNS', 'ESCS', 'BRN', 'KDY', 'AFAS', 'WHCS', 'SHS']
      expect(commands[4]).to be_a Array
      expect(commands[5]).to eq []
      expect(commands[6]).to eq nil
    end

    let(:log_destination) { LogHelper::Redirect.instance.file }
    let(:expected_file_importer_arguments) {
      [
        ['HEA', 'WSNS', 'ESCS', 'BRN', 'KDY', 'AFAS', 'WHCS', 'SHS'],
        sftp_client_double,
        log_destination,
        false
      ]
    }

    it 'returns the correct importers' do
      expect(file_import_classes).to eq([
        EducatorsImporter,
        CoursesSectionsImporter,
        EducatorSectionAssignmentsImporter,
        StudentsImporter,
        StudentSectionAssignmentsImporter,
        AttendanceImporter,
        BehaviorImporter,
        StudentSectionGradesImporter,
        StarMathImporter::RecentImporter,
        StarReadingImporter::RecentImporter,
        X2AssessmentImporter,
      ])
    end

  end

  describe '#importers' do
    context 'when provided with the default sources' do
      it 'returns X2 and STAR importers' do
        expect(task.file_import_classes(['x2', 'star'])).to eq([
          EducatorsImporter,
          CoursesSectionsImporter,
          EducatorSectionAssignmentsImporter,
          StudentsImporter,
          StudentSectionAssignmentsImporter,
          AttendanceImporter,
          BehaviorImporter,
          StudentSectionGradesImporter,
          StarMathImporter::RecentImporter,
          StarReadingImporter::RecentImporter,
          X2AssessmentImporter,
        ])
      end
    end
    context 'when provided x2 twice' do
      it 'returns x2 importers, no star importers' do
        expect(task.file_import_classes(['x2', 'x2'])).to eq([
          EducatorsImporter,
          CoursesSectionsImporter,
          EducatorSectionAssignmentsImporter,
          StudentsImporter,
          StudentSectionAssignmentsImporter,
          AttendanceImporter,
          BehaviorImporter,
          StudentSectionGradesImporter,
          X2AssessmentImporter,
        ])
      end
    end
    context 'when provided star' do
      it 'returns star importers' do
        expect(task.file_import_classes(['star'])).to eq([
          StarMathImporter::RecentImporter,
          StarReadingImporter::RecentImporter,
        ])
      end
    end
    context 'when provided with invalid sources' do
      it 'returns an empty array' do
        expect(task.file_import_classes(['x3'])).to eq([])
      end
    end
  end

  describe '#load_rails' do
    it 'defines Rails' do
      expect(task).to receive(:require).with(/config\/environment.rb/)
      task.load_rails
    end
  end

  describe '#schools' do
    context 'when passed a valid school local ID' do
      it 'returns the school local ID' do
        expect(task.school_local_ids(['HEA'])).to eq ["HEA"]
      end
    end
    context 'when passed the ELEM shorthand id' do
      it 'returns all elementary school IDs' do
        expect(task.school_local_ids(['ELEM'])).to eq %w[
          BRN HEA KDY AFAS ESCS WSNS WHCS
        ]
      end
    end
    context 'when passed the ELEM shorthand and a valid school local id in the ELEM list' do
      it 'returns all elementary school IDs' do
        expect(task.school_local_ids(['ELEM', 'HEA'])).to eq %w[
          BRN HEA KDY AFAS ESCS WSNS WHCS
        ]
      end
    end
    context 'when passed the ELEM shorthand and another valid school local id' do
      it 'returns all elementary school IDs and the other id' do
        expect(task.school_local_ids(['ELEM', 'SHS'])).to eq %w[
          BRN HEA KDY AFAS ESCS WSNS WHCS SHS
        ]
      end
    end
  end

end
