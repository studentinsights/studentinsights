require 'rails_helper'

RSpec.describe ImportTask do

  describe '#connect_transform_import' do
    before { TestPals.seed_somerville_schools_for_test! }
    let(:task) { ImportTask.new(options: {'test_mode' => true}) }

    it 'doesn\'t blow up (smoke test)' do
      task.connect_transform_import
    end

    it 'creates an import record' do
      expect { task.connect_transform_import }.to change { ImportRecord.count }.by 1
    end
  end

end
