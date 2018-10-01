require 'rails_helper'

RSpec.describe IepStorer, type: :model do
  class FakeAwsClient
    def self.put_object(args)
      {
        server_side_encryption: 'AES256'
      }
    end
  end

  class QuietLogger
    def self.info(message); end
  end

  def create_test_student
    FactoryBot.create(:student, {
      first_name: 'Alexander',
      last_name: 'Hamilton',
      local_id: '124046632'
    })
  end

  before do
    allow(File).to receive(:open).and_call_original # ActiveSupport calls this for i8n translations
    allow(File).to receive(:open).with('/tmp/path/124046632_IEPAtAGlance_Alexander_Hamilton.pdf').and_return 'eeee'
  end

  subject {
    IepStorer.new(
      file_name: '124046632_IEPAtAGlance_Alexander_Hamilton.pdf',
      path_to_file: '/tmp/path/124046632_IEPAtAGlance_Alexander_Hamilton.pdf',
      local_id: '124046632',
      client: FakeAwsClient,
      logger: QuietLogger
    )
  }

  context 'local id matches to student' do
    let!(:student) { create_test_student }

    context 'no other document for that student' do
      it 'stores an object to the db' do
        expect { subject.store }.to change(IepDocument, :count).by 1
      end
    end

    context 'other document exists for that student' do
      let!(:other_iep) {
        IepDocument.create!(student: student, file_name: '124046632_IEPAtAGlance_Alexander_MIDDLENAME_Hamilton.pdf')
      }

      it 'stores an object to the db' do
        expect { subject.store }.to change(IepDocument, :count).by 0
      end

      it 'updates the filename' do
        subject.store
        student.reload
        expect(student.latest_iep_document.file_name).to eq '124046632_IEPAtAGlance_Alexander_Hamilton.pdf'
      end
    end
  end

  context 'local id does not match to student' do
    it 'does not store an object to the db' do
      expect { subject.store }.to change(IepDocument, :count).by 0
    end
  end
end
