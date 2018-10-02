require 'spec_helper'

RSpec.describe IepDocument do
  def create_test_student(attrs = {})
    FactoryBot.create(:student, {
      first_name: 'Alexander',
      last_name: 'Hamilton',
      local_id: '124046632'
    }.merge(attrs))
  end

  def create_iep_document(student, attrs = {})
    created_at = attrs.fetch(:created_at, Time.now)
    FactoryBot.create(:iep_document, {
      student: student,
      created_at: created_at
    }.merge(attrs))
  end

  describe '#pretty_filename_for_download' do
    it 'works' do
      student = create_test_student(id: 978)
      iep_document = create_iep_document(student, {
        id: 9003,
        created_at: Time.parse('2017-04-03')
      })
      expect(iep_document.pretty_filename_for_download).to eq 'IEP_HamiltonAlexander_20170403_978_9003.pdf'
    end
  end

  it 'can create with expected file_name format' do
    expect(create_iep_document(create_test_student, {
      file_name: '124046632_IEPAtAGlance_Alexander_Hamilton.pdf'
    }).errors.details).to eq({})
  end

  it 'validates that local_id in filename matches referenced student' do
    expect {
      create_iep_document(create_test_student, file_name: '99999999_IEPAtAGlance_Alexander_Hamilton.pdf')
    }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'validates that file_name can be parsed' do
    expect {
      create_iep_document(create_test_student, file_name: '124046632_Alexander_Hamilton.pdf')
    }.to raise_error(ActiveRecord::RecordInvalid)
  end
end
