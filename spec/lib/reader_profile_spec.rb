require 'spec_helper'

RSpec.describe ReaderProfile do
  let!(:pals) { TestPals.create! }

  def mock_s3_reads!
    mock_s3 = MockAwsS3::MockedAwsS3.create_with_read_block {|key, bucket| '<pdfbytes>' }
    allow(Aws::S3::Client).to receive(:new).and_return mock_s3
  end

  class MockPdfReader < Struct.new :pages
    class Page < Struct.new :number, :text; end
  end

  def mock_pdf_reader_for_iep!
    mock_pdf_reader = MockPdfReader.new([
      MockPdfReader::Page.new(1, 'this is an IEP'),
      MockPdfReader::Page.new(2, 'these are accomodations')
    ])
    allow(PDF::Reader).to receive(:new).and_return mock_pdf_reader
  end

  def create_iep_for!(student, time_now)
    file_name = "#{student.local_id}_IEPAtAGlance_#{student.first_name}_#{student.last_name}.pdf"
    file_digest = SecureRandom.hex
    IepDocument.create!(
      student: student,
      file_name: file_name,
      file_digest: file_digest,
      file_size: 1000 + SecureRandom.random_number(100000),
      created_at: time_now,
      updated_at: time_now,
      s3_filename: "#{SecureRandom.hex}/#{time_now.strftime('%Y-%m-%d')}/#{file_digest}"
    )
  end

  describe '#reader_profile_json' do
    it 'returns correct shape on happy path' do
      student = pals.healey_kindergarten_student
      mock_s3_reads!
      create_iep_for!(student, pals.time_now)
      mock_pdf_reader_for_iep!

      ReadingBenchmarkDataPoint.create!({
        student: student,
        educator: pals.uri,
        benchmark_school_year: 2017,
        benchmark_period_key: :winter,
        benchmark_assessment_key: :dibels_dorf_wpm,
        json: { value: 101 }
      })
      EventNote.create!({
        educator: pals.uri,
        student: student,
        event_note_type_id: 301,
        text: 'blah',
        recorded_at: pals.time_now - 7.days
      })

      reader_profile = ReaderProfile.new(student, time_now: pals.time_now)
      json = reader_profile.reader_profile_json.as_json
      expect(json.keys).to contain_exactly(*[
        'access',
        'current_school_year',
        'benchmark_data_points',
        'feed_cards',
        'services',
        'iep_contents'
      ])
      expect(json['iep_contents']).to match({
        'iep_document'=>{
          "id"=>1,
          "file_name"=>"111111111_IEPAtAGlance_Garfield_Skywalker.pdf",
          "student_id"=>student.id,
          "created_at"=>pals.time_now.as_json,
          "updated_at"=>pals.time_now.as_json,
          "file_digest"=>anything(),
          "file_size"=>anything(),
          "s3_filename"=>anything()
        },
        'pretty_filename_for_download'=>"IEP_SkywalkerGarfield_20180313_1_1.pdf",
        'pages'=>[{
          'number'=>1,
          'text'=>"this is an IEP"
        },{
          'number'=>2,
          'text'=>"these are accomodations"
        }]
      })
      expect(json['benchmark_data_points']).to match([{
        "id"=>1,
        "student_id"=>student.id,
        "benchmark_school_year"=>2017,
        "benchmark_period_key"=>"winter",
        "benchmark_assessment_key"=>"dibels_dorf_wpm",
        "json"=>{"value"=>101},
        "educator_id"=>pals.uri.id,
        "created_at"=>anything(),
        "updated_at"=>anything()
      }])
      expect(json['access']).to eq({
        "composite"=>nil,
        "comprehension"=>nil,
        "literacy"=>nil,
        "oral"=>nil,
        "listening"=>nil,
        "reading"=>nil,
        "speaking"=>nil,
        "writing"=>nil
      })
      expect(json['current_school_year']).to eq(2017)
      expect(json['feed_cards'].size).to eq 1
      expect(json['services'].size).to eq 0
    end
  end
end
