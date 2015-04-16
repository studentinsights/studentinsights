RSpec.describe StudentPresenter do

  let(:student_without_attributes) { FactoryGirl.create(:student) }
  let(:student_with_full_name) { FactoryGirl.create(:student_with_full_name) }
  let(:sped_student) { FactoryGirl.create(:sped_student) }
  let(:lep_student) { FactoryGirl.create(:lep_student) }
  let(:non_lep_student) { FactoryGirl.create(:non_lep_student) }
  let(:non_sped_student) { FactoryGirl.create(:non_sped_student) }

  describe '#full_name' do
    context 'has a first and last name' do
      it 'presents the full name' do
        presenter = StudentPresenter.new student_with_full_name
        expect(presenter.full_name).to eq student_with_full_name.first_name + " " + student_with_full_name.last_name
      end
    end
  end
  describe '#sped' do
    context 'has a sped status' do
      context 'is sped' do
        it 'presents Yes' do
          presenter = StudentPresenter.new sped_student
          expect(presenter.sped).to eq "Yes"
        end
      end
      context 'is not sped' do
        it 'presents No' do
          presenter = StudentPresenter.new non_sped_student
          expect(presenter.sped).to eq "No"
        end
      end
    end
    context 'does not have a sped status' do
      it 'presents N/A' do
        presenter = StudentPresenter.new student_without_attributes
        expect(presenter.sped).to eq "N/A"
      end
    end
  end
  describe '#limited_english_proficient' do
    context 'has a limited english proficient status' do
      context 'is limited english proficient' do
        it 'presents Yes' do
          presenter = StudentPresenter.new lep_student
          expect(presenter.limited_english_proficient).to eq "Yes"
        end
      end
      context 'is limited english proficient' do
        it 'presents No' do
          presenter = StudentPresenter.new non_lep_student
          expect(presenter.limited_english_proficient).to eq "No"
        end
      end
    end
    context 'does not have a limited english proficient status' do
      it 'presents N/A' do
        presenter = StudentPresenter.new student_without_attributes
        expect(presenter.limited_english_proficient).to eq "N/A"
      end
    end
  end
end
