require 'spec_helper'

RSpec.describe IepDocument do
  def create_test_student
    FactoryBot.create(:student, {
      first_name: 'Alexander',
      last_name: 'Hamilton',
      local_id: '124046632'
    })
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
