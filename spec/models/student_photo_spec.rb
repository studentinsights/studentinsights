require 'spec_helper'

RSpec.describe StudentPhoto do
  let!(:pals) { TestPals.create! }

  def random_hex
    32.times.map { rand(16).to_s(16) }.join()
  end

  def create_student_photo(params = {})
    StudentPhoto.create({
      student_id: pals.healey_kindergarten_student.id,
      file_digest: random_hex(),
      file_size: 1000 + rand(100000),
      s3_filename: random_hex()
    }.merge(params))
  end

  describe 'presence validations' do
    it 'requires student_id, file_digest, file_size, s3_filename' do
      expect(create_student_photo({
        student_id: nil,
        file_digest: nil,
        file_size: nil,
        s3_filename: nil
      }).errors.details).to eq({
        :file_digest => [{:error=>:blank}],
        :file_size => [{:error=>:blank}],
        :s3_filename => [{:error=>:blank}],
        :student => [{:error=>:blank}],
      })
    end
  end
end
