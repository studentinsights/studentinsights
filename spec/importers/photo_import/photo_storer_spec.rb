require 'spec_helper'

RSpec.describe PhotoStorer do
  class FakeAwsClient
    def self.put_object(args)
      {
        server_side_encryption: 'AES256'
      }
    end
  end

  class QuietLogger
    def self.info(message); puts message end
  end

  before do
    allow(Digest::SHA256).to receive(:file).with('/path/to/file').and_return('HASH.HASH.HASH')
    allow(File).to receive(:size).with('/path/to/file').and_return 10
    allow(File).to receive(:open).and_call_original # ActiveSupport calls this for i8n translations
    allow(File).to receive(:open).with('/path/to/file').and_return 'ImageData'
  end

  let!(:student) { FactoryBot.create(:student, local_id: '111111111') }

  def photo_storer(attributes = {})
    default_attributes = {
      local_id: student.local_id,
      path_to_file: '/path/to/file',
      s3_client: FakeAwsClient,
      logger: QuietLogger,
      time_now: Time.now
    }

    PhotoStorer.new(default_attributes.merge(attributes))
  end


  describe '#store_only_new' do
    context 'student not in database' do
      let(:test_subject) { photo_storer(local_id: '2222229') }

      it 'returns nil, does not call AWS' do
        expect(test_subject.store_only_new).to eq nil
      end
    end

    context 'photo already exists' do

    end

    context 'photo is new' do
      let(:test_subject) { photo_storer }

      it 'calls AWS correctly, stores a photo record' do
        expect(test_subject.store_only_new).not_to eq nil
      end
    end
  end
end