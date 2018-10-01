require 'rails_helper'

RSpec.describe IepStorer, type: :model do
  class FakeAwsClient
    def self.put_object(args)
      {
        server_side_encryption: 'AES256'
      }
    end
  end

  def create_test_student
    FactoryBot.create(:student, {
      first_name: 'Alexander',
      last_name: 'Hamilton',
      local_id: '124046632'
    })
  end

  def create_mocked_iep_storer(attrs = {})
    path_to_file = '/tmp/path/124046632_IEPAtAGlance_Alexander_Hamilton.pdf'
    storer = IepStorer.new({
      path_to_file: path_to_file,
      s3_client: FakeAwsClient,
      log: LogHelper::FakeLog.new
    }.merge(attrs))
    allow(File).to receive(:open).and_call_original # ActiveSupport calls this for i8n translations
    allow(File).to receive(:open).with(path_to_file).and_return '<pdfbytes>'
    allow(File).to receive(:size).with(path_to_file).and_return 1000 + SecureRandom.random_number(100000)
    allow(storer).to receive(:file_digest).and_return SecureRandom.hex
    storer
  end

  context 'happy path, first document for that student' do
    it 'stores an object to s3 and the db' do
      student = create_test_student
      log = LogHelper::FakeLog.new
      storer = create_mocked_iep_storer(log: log)

      expect { storer.store_only_new }.to change(IepDocument, :count).by 1
      expect(log.output).to include 'storing iep pdf'
      expect(log.output).to include 'creating IepDocument record'
      expect(IepDocument.last.student).to eq student
    end
  end

  context 'other document exists for that student' do
    it 'stores a new object to s3 and the db' do
      student = create_test_student
      existing_iep_document = IepDocument.create!({
        student: student,
        file_name: '124046632_IEPAtAGlance_Alexander_MIDDLENAME_Hamilton.pdf'
      })
      log = LogHelper::FakeLog.new
      storer = create_mocked_iep_storer(log: log)

      expect { storer.store_only_new }.to change(IepDocument, :count).by 1
      expect(log.output).to include 'storing iep pdf'
      expect(log.output).to include 'creating IepDocument record'
      expect(IepDocument.last.student).to eq student
      expect(existing_iep_document.changed?).to eq false
    end
  end

  context 'local id does not match to student' do
    it 'logs and drops' do
      log = LogHelper::FakeLog.new
      storer = create_mocked_iep_storer(log: log)

      expect { storer.store_only_new }.to change(IepDocument, :count).by 0
      expect(log.output).to include 'dropping the IEP PDF file'
    end
  end

end
