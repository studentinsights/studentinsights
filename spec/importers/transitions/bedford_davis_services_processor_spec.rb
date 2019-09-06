require 'rails_helper'

RSpec.describe BedfordDavisServicesProcessor do
  let!(:pals) { TestPals.create! }

  def social_emotional_fixture_file_text
    IO.read("#{Rails.root}/spec/importers/transitions/bedford_davis_social_emotional_fixture.csv")
  end

  def transition_notes_fixture_file_text
    IO.read("#{Rails.root}/spec/importers/transitions/bedford_davis_transition_notes_fixture.csv")
  end

  def create_processor(options = {})
    log = LogHelper::FakeLog.new
    processor = BedfordDavisServicesProcessor.new(pals.rich_districtwide, {
      log: log,
      time_now: pals.time_now
    })
    [processor, log]
  end

  describe 'private #find_service_type_names' do
    it 'works with an example using the mapping' do
      processor, _ = create_processor()
      row = {
        "Teacher"=>"X",
        "LASID"=>"111222222",
        "Student Name"=>"Mari Kenobi",
        "Soc.Emo. Check in w/ counselor"=>"FALSE",
        "Soc. Emo. Small group"=>"TRUE",
        "Soc. Emo. individual counseling"=>"FALSE",
        "Formal Behavior Plan"=>"FALSE",
        "Notes from the counselor"=>nil,
        "Counselor "=>nil
      }
      expect(processor.send(:find_service_type_names, row)).to eq([
        'Social Group'
      ])
    end
  end

  it 'works for social emotional format' do
    processor, log = create_processor()
    rows = processor.dry_run(social_emotional_fixture_file_text)

    records = rows.map {|row| Service.create!(row)} # to exercise validations
    expect(log.output).to include('processed_rows_count=>4')
    expect(records.size).to eq(2)
    expect(records.as_json({
      except: [:id, :created_at, :updated_at]
    })).to eq([{
      "student_id"=>pals.shs_senior_kylo.id,
      "service_type_id"=>703,
      'recorded_by_educator_id' => pals.rich_districtwide.id,
      "recorded_at"=>'2018-03-13 11:03:00.000000000 +0000',
      "date_started"=>'2017-08-15 00:00:00.000000000 +0000',
      "estimated_end_date"=>'2018-06-30 00:00:00.000000000 +0000',
      "discontinued_at"=>'2018-06-30 00:00:00.000000000 +0000',
      "discontinued_by_educator_id"=>pals.rich_districtwide.id,
      "provided_by_educator_name"=>nil,
      "service_upload_id"=>nil
    },{
      "student_id"=>pals.shs_freshman_amir.id,
      "service_type_id"=>705,
      'recorded_by_educator_id' => pals.rich_districtwide.id,
      "recorded_at"=>'2018-03-13 11:03:00.000000000 +0000',
      "date_started"=>'2017-08-15 00:00:00.000000000 +0000',
      "estimated_end_date"=>'2018-06-30 00:00:00.000000000 +0000',
      "discontinued_at"=>'2018-06-30 00:00:00.000000000 +0000',
      "discontinued_by_educator_id"=>pals.rich_districtwide.id,
      "provided_by_educator_name"=>nil,
      "service_upload_id"=>nil
    }])
  end

  it 'works for transition notes format' do
    processor, log = create_processor()
    rows = processor.dry_run(transition_notes_fixture_file_text)

    records = rows.map {|row| Service.create!(row)} # to exercise validations
    expect(log.output).to include('processed_rows_count=>1')
    expect(records.size).to eq(2)
    expect(records.as_json({
      except: [:id, :created_at, :updated_at]
    })).to eq([{
      'student_id' => pals.healey_kindergarten_student.id,
      'service_type_id'=>707,
      'recorded_by_educator_id' => pals.rich_districtwide.id,
      "recorded_at"=>'2018-03-13 11:03:00.000000000 +0000',
      "date_started"=>'2017-08-15 00:00:00.000000000 +0000',
      "estimated_end_date"=>'2018-06-30 00:00:00.000000000 +0000',
      "discontinued_at"=>'2018-06-30 00:00:00.000000000 +0000',
      "discontinued_by_educator_id"=>pals.rich_districtwide.id,
      "provided_by_educator_name"=>nil,
      "service_upload_id"=>nil
    },{
      'student_id' => pals.healey_kindergarten_student.id,
      'service_type_id'=>708,
      'recorded_by_educator_id' => pals.rich_districtwide.id,
      "recorded_at"=>'2018-03-13 11:03:00.000000000 +0000',
      "date_started"=>'2017-08-15 00:00:00.000000000 +0000',
      "estimated_end_date"=>'2018-06-30 00:00:00.000000000 +0000',
      "discontinued_at"=>'2018-06-30 00:00:00.000000000 +0000',
      "discontinued_by_educator_id"=>pals.rich_districtwide.id,
      "provided_by_educator_name"=>nil,
      "service_upload_id"=>nil
    }])
  end
end
