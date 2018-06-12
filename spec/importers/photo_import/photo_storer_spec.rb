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
    def self.info(message); end
  end

  before do
    allow(ENV).to receive(:[]).with('AWS_S3_PHOTOS_BUCKET').and_return('mock-test-photo-bucket')
    allow(Digest::SHA256).to receive(:file).with('/path/to/file').and_return('HashedImageFile')
    allow(File).to receive(:size).with('/path/to/file').and_return 10
    allow(File).to receive(:open).and_call_original # ActiveSupport calls this for i8n translations
    allow(File).to receive(:open).with('/path/to/file').and_return 'ImageData'
  end

  let!(:student) { FactoryBot.create(:student, local_id: '111111111') }

  HASHED_STUDENT_LOCAL_ID = '1a5376ad727d65213a79f3108541cf95012969a0d3064f108b5dd6e7f8c19b89'

  def photo_storer(attributes = {})
    default_attributes = {
      local_id: student.local_id,
      path_to_file: '/path/to/file',
      s3_client: FakeAwsClient,
      logger: QuietLogger,
      time_now: Time.new(2017, 5, 11)
    }

    PhotoStorer.new(default_attributes.merge(attributes))
  end


  describe '#store_only_new' do
    context 'student not in database' do
      let(:test_subject) { photo_storer(local_id: '2222229') }

      it 'returns nil' do
        expect(test_subject.store_only_new).to eq nil
      end

      it 'does not call AWS' do
        expect(FakeAwsClient).not_to receive(:put_object)
        test_subject.store_only_new
      end

      it 'does not store a record to the database' do
        expect { test_subject.store_only_new }.to change { StudentPhoto.count }.by 0
      end
    end

    context 'photo already exists' do
      let(:test_subject) { photo_storer }

      it 'returns nil' do
        test_subject.store_only_new
        expect(test_subject.store_only_new).to eq nil
      end

      it 'does not call AWS' do
        test_subject.store_only_new
        expect(FakeAwsClient).not_to receive(:put_object)
        test_subject.store_only_new
      end

      it 'does not store a record to the database' do
        test_subject.store_only_new
        expect { test_subject.store_only_new }.to change { StudentPhoto.count }.by 0
      end
    end

    context 'photo is new' do
      let(:test_subject) { photo_storer }

      it 'returns a student photo object' do
        photo_object = test_subject.store_only_new

        expect(photo_object).not_to be_nil
        expect(photo_object.class).to eq(StudentPhoto)
      end

      it 'does not call AWS' do
        expect(FakeAwsClient).to receive(:put_object).with({
          bucket: "mock-test-photo-bucket",
          key: "#{HASHED_STUDENT_LOCAL_ID}/2017-05-11/HashedImageFile",
          body: "ImageData",
          server_side_encryption: "AES256"
        })

        test_subject.store_only_new
      end

      it 'does not store a record to the database' do
        expect { test_subject.store_only_new }.to change { StudentPhoto.count }.by 1
      end
    end
  end
end