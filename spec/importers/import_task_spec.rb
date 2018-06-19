require 'rails_helper'

RSpec.describe ImportTask do
  let!(:pals) { TestPals.create! }

  def mock_all_importers!
    FileImporterOptions.importer_descriptions.map(&:importer_class).each do |importer_class|
      mock_importer = instance_double(importer_class)
      allow(mock_importer).to receive(:import)
      allow(importer_class).to receive(:new).and_return mock_importer
    end
  end

  def test_options
    {
      school_local_ids: ['HEA'],
      importer_keys: ['AttendanceImporter'],
      only_recent_attendance: false,
      log: LogHelper::FakeLog.new
    }
  end

  describe '#connect_transform_import' do
    it 'requires arguments to be passed explicitly' do
      expect { ImportTask.new(test_options.except(:school_local_ids)) }.to raise_error(RuntimeError, 'missing school_local_ids')
      expect { ImportTask.new(test_options.except(:importer_keys)) }.to raise_error(RuntimeError, 'missing importer_keys')
      expect { ImportTask.new(test_options.except(:only_recent_attendance)) }.to raise_error(RuntimeError, 'missing only_recent_attendance')
    end

    describe 'with all importers mocked, logs output and creates an import record' do
      before do
        mock_all_importers!
        options = test_options
        expect { ImportTask.new(options).connect_transform_import }.to change { ImportRecord.count }.by 1
        @log_output = options[:log].output
      end

      it 'runs initial reports' do
        expect(@log_output).to include('ImportTask: Setting up logging...')
        expect(@log_output).to include('Running inital report...')
        expect(@log_output).to include('=== INITIAL DATABASE COUNTS ===')
      end

      it 'runs the importer' do
        expect(@log_output).to include('ImportTask: Starting importing work...')
        expect(@log_output).to include('ImportTask: Starting file_importer#import for RSpec::Mocks::InstanceVerifyingDouble...')
        expect(@log_output).not_to include('Error!')
      end

      it 'runs a final report' do
        expect(@log_output).to include('=== FINAL DATABASE COUNTS ===')
        expect(@log_output).to include('=== IMPORT TIMING ===')
        expect(@log_output).to include('=== ASSESSMENTS REPORT ===')
        expect(@log_output).to include('ImportTask: Done with everything.')
      end
    end
  end

end
