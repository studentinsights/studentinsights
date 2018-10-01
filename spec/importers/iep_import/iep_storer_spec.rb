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

  def create_mocked_iep_storer
    storer = IepStorer.new(
      path_to_file: '/tmp/path/124046632_IEPAtAGlance_Alexander_Hamilton.pdf',
      s3_client: FakeAwsClient,
      logger: LogHelper::QuietLogger.new
    )
    allow(File).to receive(:open).and_call_original # ActiveSupport calls this for i8n translations
    allow(File).to receive(:open).with('/tmp/path/124046632_IEPAtAGlance_Alexander_Hamilton.pdf').and_return 'eeee'
    allow(File).to receive(:size).with('/tmp/path/124046632_IEPAtAGlance_Alexander_Hamilton.pdf').and_return 1000 + SecureRandom.random_number(100000)
    allow(storer).to receive(:file_digest).and_return SecureRandom.hex
    storer
  end

  context 'happy path, first document for that student' do
    it 'stores an object to s3 and the db' do
      create_test_student
      expect { create_mocked_iep_storer.store_only_new }.to change(IepDocument, :count).by 1
    end
  end

  context 'other document exists for that student' do
    it 'stores a new object to s3 and the db' do
      student = create_test_student
      IepDocument.create!(student: student, file_name: '124046632_IEPAtAGlance_Alexander_MIDDLENAME_Hamilton.pdf')

      expect { create_mocked_iep_storer.store_only_new }.to change(IepDocument, :count).by 1
      expect(student.latest_iep_document.file_name).to eq '124046632_IEPAtAGlance_Alexander_Hamilton.pdf'
      expect(student.iep_documents.size).to eq 2
    end
  end

  context 'local id does not match to student' do
    it 'logs and drops' do
      expect { create_mocked_iep_storer.store_only_new }.to change(IepDocument, :count).by 0
    end
  end

end
