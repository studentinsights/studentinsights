require 'spec_helper'

RSpec.describe Searchbar do
  let!(:pals) { TestPals.create! }

  describe '.names_for' do
    let(:garfield) { {label: "Garfield Skywalker - HEA - KF", id:  pals.healey_kindergarten_student.id} }
    let(:meredith) { {label: "Meredith Solo - HEA - 5", id: pals.healey_meredith_student.id } }
    let(:mari) { {label: "Mari Kenobi - SHS - 9", id: pals.shs_freshman_mari.id } }

    it 'enforces authorization' do
      expect(Searchbar.names_for(pals.uri)).to eq [garfield, meredith, mari]
      expect(Searchbar.names_for(pals.healey_vivian_teacher)).to eq [garfield]
      expect(Searchbar.names_for(pals.healey_ell_teacher)).to eq []
      expect(Searchbar.names_for(pals.healey_sped_teacher)).to eq []
      expect(Searchbar.names_for(pals.healey_laura_principal)).to eq [garfield, meredith]
      expect(Searchbar.names_for(pals.healey_sarah_teacher)).to eq [meredith]
      expect(Searchbar.names_for(pals.west_marcus_teacher)).to eq []
      expect(Searchbar.names_for(pals.shs_jodi)).to eq [mari]
      expect(Searchbar.names_for(pals.shs_bill_nye)).to eq [mari]
      expect(Searchbar.names_for(pals.shs_hugo_art_teacher)).to eq []
      expect(Searchbar.names_for(pals.shs_fatima_science_teacher)).to eq []
    end
  end
end