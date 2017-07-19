require 'rails_helper'

RSpec.describe IepStorer, type: :model do
  class FakeAwsClient
    def self.put_object(args); end
  end

  class QuietLogger
    def self.info(message); end
  end

  before do
    allow(File).to receive(:open).and_return 'eeee'
  end

  subject {
    IepStorer.new(
      file_name: 'IEP Document',
      path_to_file: '/path/to/file',
      file_date: DateTime.current,
      local_id: 'abc_student_local_id',
      client: FakeAwsClient,
      logger: QuietLogger
    )
  }

  context 'local id matches to student' do
    before {
      Student.create!(
        local_id: 'abc_student_local_id', grade: 'KF'
      )
    }

    it 'stores an object to the db' do
      expect { subject.store }.to change(IepDocument, :count).by 1
    end
  end

  context 'local id does not match to student' do
    it 'does not store an object to the db' do
      expect { subject.store }.to change(IepDocument, :count).by 0
    end
  end

end
