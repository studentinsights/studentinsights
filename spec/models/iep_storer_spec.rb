require 'rails_helper'

RSpec.describe IepStorer, type: :model do
  subject {
    IepStorer.new(
      file_name: 'IEP Document',
      path_to_file: '/path/to/file',
      file_date: DateTime.current,
      local_id: 'abc_student_local_id'
    )
  }

  context 'local id matches to student' do
    it 'stores an object to the db' do

    end
  end

  context 'local id does not match to student' do
    it 'does not store an object to the db' do

    end
  end

end
