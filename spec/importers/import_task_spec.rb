require 'rails_helper'

RSpec.describe ImportTask do

  describe '#connect_transform_import' do
    let(:task) { ImportTask.new(options: {'test_mode' => true}) }

    it 'doesn\'t blow up (smoke test)' do
      task.connect_transform_import
    end
  end

end
