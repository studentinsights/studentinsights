require 'spec_helper'

RSpec.describe IepDocument do
  def create_test_student(attrs = {})
    FactoryBot.create(:student, {

      first_name: 'Alexander',
      last_name: 'Hamilton',
      local_id: '124046632'
    }.merge(attrs))
  end

  describe '#pretty_filename_for_download' do
    it 'works' do
      student = create_test_student(id: 978)
      iep_document = IepDocument.create({
        id: 9003,
        created_at: '2017-04-03',
        student: student,
        file_name: '124046632_IEPAtAGlance_Alexander_Hamilton.pdf'
      })
      expect(iep_document.pretty_filename_for_download).to eq 'IEP_HamiltonAlexander_20170403_978_9003.pdf'
    end
  end

  it 'can create with expected file_name format' do
    expect(IepDocument.create({
      student: create_test_student,
      file_name: '124046632_IEPAtAGlance_Alexander_Hamilton.pdf'
    }).errors.details).to eq({})
  end

  it 'validates that local_id in filename matches referenced student' do
    expect(IepDocument.create({
      student: create_test_student,
      file_name: '99999999_IEPAtAGlance_Alexander_Hamilton.pdf'
    }).errors.details).to eq({
      student_id: [{error: 'reference does not match local_id in filename'}]
    })
  end

  it 'validates that file_name can be parsed' do
    expect(IepDocument.create({
      student: create_test_student,
      file_name: '124046632_Alexander_Hamilton.pdf'
    }).errors.details).to eq({
      file_name: [{error: 'could not be parsed'}]
    })
  end
end
