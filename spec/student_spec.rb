require 'rails_helper'

describe Student do

  describe '#create' do

    context 'when all demographics are present' do

      it 'creates a new Student' do

        new_student = Student.create(
          new_id: 342,
          grade: "K", 
          hispanic_latino: false, 
          race: "B", 
          limited_english: true, 
          low_income: true
        )

        expect( Student.all.length ).to eq( 1 ) 
      end
    end

    context 'when demograpics are missing' do

      it 'does not create a new Student' do

        Student.create(
          grade: "K", 
          limited_english: false, 
          low_income: false
        ) 

        expect( Student.all.length ).to eq( 0 ) 
      end
    end
  end
end