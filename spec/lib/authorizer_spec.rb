require 'spec_helper'

# This is just sugar
def authorized_only(educator, &block)
  Authorizer.new(educator).authorized_only(&block)
end

def setup_test_context
  {
    # educators
    districtwide_admin: FactoryGirl.create(:educator, districtwide_access: true),

    # healey
    healey: School.find_by_local_id('HEA'),
    healey_kindergarten_homeroom: FactoryGirl.create(:homeroom, school: healey),
    healey_kindergarten_student: FactoryGirl.create(:student, {
      school: healey,
      homeroom: healey_kindergarten_homeroom,
      grade: 'KF'
    }),
    healey_teacher: FactoryGirl.create(:educator, {
      school: healey,
      homeroom: healey_kindergarten_homeroom
    }),

    # high school
    shs: School.find_by_local_id('SHS'),
    shs_homeroom: FactoryGirl.create(:homeroom, school: shs),
    shs_student: FactoryGirl.create(:student, {
      school: shs,
      homeroom: shs_homeroom,
      grade: '9'
    }),
    shs_teacher: FactoryGirl.create(:educator, school: shs)
  }
end

RSpec.describe Authorizer do
  before { School.seed_somerville_schools }

  # districtwide
  let!(:districtwide_admin) do
    FactoryGirl.create(:educator, districtwide_access: true)
  end

  # healey
  let!(:healey) { School.find_by_local_id('HEA') }
  let!(:healey_kindergarten_homeroom) { FactoryGirl.create(:homeroom, school: healey) }
  let!(:healey_kindergarten_student) do
    FactoryGirl.create(:student, {
      school: healey,
      homeroom: healey_kindergarten_homeroom,
      grade: 'KF'
    })
  end
  let!(:healey_teacher) do
    FactoryGirl.create(:educator, {
      school: healey,
      homeroom: healey_kindergarten_homeroom
    })
  end

  # high school
  let!(:shs) { School.find_by_local_id('SHS') }
  let!(:shs_homeroom) { FactoryGirl.create(:homeroom, school: shs) }
  let!(:shs_student) do
    FactoryGirl.create(:student, {
      school: shs,
      homeroom: shs_homeroom,
      grade: '9'
    })
  end
  let!(:shs_teacher) do
    FactoryGirl.create(:educator, {
      school: shs,
      homeroom: shs_homeroom
    })
  end

  it 'test context is setup correctly' do
    expect(School.all.size).to eq 12
    expect(Homeroom.all.size).to eq 2
    expect(Student.unscoped.all.size).to eq 2
    expect(Educator.all.size).to eq 3
  end

  describe 'Student' do
    it 'limits access with Student.all' do
      expect(authorized_only(districtwide_admin) { Student.all }).to eq [
        healey_kindergarten_student,
        shs_student
      ]
      expect(authorized_only(healey_teacher) { Student.all }).to eq [
        healey_kindergarten_student
      ]
      expect(authorized_only(shs_teacher) { Student.all }).to eq [
        shs_student
      ]
    end

    it 'limits access for Student.find' do
      expect(authorized_only(healey_teacher) { Student.find(shs_student.id) }).to eq nil
    end

    it 'limits access for arrays' do
      expect(authorized_only(healey_teacher) { [shs_student, healey_kindergarten_student] }).to eq [healey_kindergarten_student]
    end
  end

  describe 'other models' do
    it 'raises on calls with unchecked models' do
      expect { authorized_only(districtwide_admin) { Educator.all } }.to raise_error(Exceptions::EducatorNotAuthorized)
    end
  end
end
