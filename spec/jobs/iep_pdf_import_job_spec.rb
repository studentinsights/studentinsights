require 'rails_helper'

RSpec.describe IepPdfImportJob do

  def create_import_job_with_mock_files(attrs = {})
    ENV['AWS_ACCESS_KEY_ID'] = 'fake-AWS_ACCESS_KEY_ID-for-test'
    ENV['AWS_SECRET_ACCESS_KEY'] = 'fake-AWS_SECRET_ACCESS_KEY-for-test'
    ENV['AWS_S3_IEP_BUCKET'] = 'fake-AWS_S3_IEP_BUCKET-for-test'
    import_job = IepPdfImportJob.new({
      s3_client: MockAwsS3.with_put_mocked
    }.merge(attrs))
    allow(import_job).to receive(:download_zips).and_return [
      File.open("#{Rails.root}/spec/jobs/iep-pdfs-for-test-2.zip"),
      File.open("#{Rails.root}/spec/jobs/iep-pdfs-for-test-1.zip")
    ]
    import_job
  end

  describe '#nightly_import!' do
    let!(:pals) { TestPals.create!}

    it 'works for files pointing to TestPals' do
      log = LogHelper::FakeLog.new
      import_job = create_import_job_with_mock_files(log: log)

      expect { import_job.nightly_import! }.to change(IepDocument, :count).by 3
      expect(log.output).to include 'Downloaded 2 zip files.'
      expect(log.output).to include 'unzipping iep-pdfs-for-test-2.zip...'
      expect(log.output).to include 'unzipped 2 files from iep-pdfs-for-test-2.zip...'
      expect(log.output).to include 'unzipping iep-pdfs-for-test-1.zip...'
      expect(log.output).to include 'unzipped 1 files from iep-pdfs-for-test-1.zip...'
      expect(log.output).to include 'storing iep pdf for student_local_id:2222222211 in s3...'
      expect(log.output).to include 'storing iep pdf for student_local_id:333333333 in s3...'
      expect(log.output).to include 'storing iep pdf for student_local_id:111111111 in s3...'
      expect(log.output).to include 'found 3 PDF files within downloaded zips.'
      expect(log.output).to include 'created 3 IepDocument records.'
    end
  end
end
