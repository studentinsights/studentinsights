require 'rails_helper'

describe Student do

  describe '#create' do

    context 'when all demographics are present' do

      it 'creates a new Student' do

        new_student = Student.create({
          grade: "K", 
          hispanic_latino: false, 
          race: "B", 
          limited_english: false, 
          low_income: false
        })
        expect { new_student } .not_to raise_error
      end
    end

    context 'when demograpics are missing' do

      it 'does not create a new Student' do
        new_student = Student.create({
          grade: "K", 
          limited_english: false, 
          low_income: false
        })
        expect { new_student }.to raise_error

      end
    end

  end

end