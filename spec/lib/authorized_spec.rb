require 'spec_helper'


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

RSpec.describe Authorized do
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
    expect(School.all.size).to eq 11
    expect(Homeroom.all.size).to eq 2
    expect(Student.unscoped.all.size).to eq 2
    expect(Educator.all.size).to eq 3
  end

  describe '#students' do
    it 'limits access' do
      expect(Authorized.new(districtwide_admin).students).to eq [
        healey_kindergarten_student,
        shs_student
      ]
      expect(Authorized.new(healey_teacher).students).to eq [
        healey_kindergarten_student
      ]
      expect(Authorized.new(shs_teacher).students).to eq [
        shs_student
      ]
    end
  end

  describe 'Student' do
    it 'limits access by default_scope' do
      expect(Student.where(id: shs_student.id).length).to eq 0
      expect { Student.find(shs_student.id) }.to raise_error(ActiveRecord::RecordNotFound)
      expect(Student.unscoped.find(shs_student.id)).to eq shs_student
    end

    it 'limits access by default_scope for associations' do
      expect(healey_teacher.students.length).to eq 0
      expect(healey_teacher.students.DANGEROUS).to eq [
        healey_kindergarten_student
      ]
    end
  end
end
