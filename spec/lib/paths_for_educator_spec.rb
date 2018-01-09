require 'spec_helper'

RSpec.describe PathsForEducator do
  let!(:pals) { TestPals.create! }

  it '#homepage_path' do
    expect(PathsForEducator.new(pals.uri).homepage_path).to eq '/educators/districtwide'

    # healey
    expect(PathsForEducator.new(pals.healey_laura_principal).homepage_path).to eq '/schools/hea'
    expect(PathsForEducator.new(pals.healey_ell_teacher).homepage_path).to eq '/no_default_page'
    expect(PathsForEducator.new(pals.healey_sped_teacher).homepage_path).to eq '/no_default_page'
    expect(PathsForEducator.new(pals.healey_vivian_teacher).homepage_path).to eq "/homerooms/#{pals.healey_kindergarten_homeroom.slug}"
    expect(PathsForEducator.new(pals.healey_sarah_teacher).homepage_path).to eq "/homerooms/#{pals.healey_fifth_homeroom.slug}"

    # west
    expect(PathsForEducator.new(pals.west_marcus_teacher).homepage_path).to eq "/homerooms/#{pals.west_fifth_homeroom.slug}"

    # high school
    expect(PathsForEducator.new(pals.shs_jodi).homepage_path).to eq '/no_default_page'
    expect(PathsForEducator.new(pals.shs_ninth_grade_counselor).homepage_path).to eq '/schools/shs'
    expect(PathsForEducator.new(pals.shs_bill_nye).homepage_path).to eq "/sections/#{pals.shs_tuesday_biology_section.id}"
    expect(PathsForEducator.new(pals.shs_hugo_art_teacher).homepage_path).to eq "/sections/#{pals.shs_second_period_ceramics.id}"
    expect(PathsForEducator.new(pals.shs_fatima_science_teacher).homepage_path).to eq "/sections/#{pals.shs_third_period_physics.id}"
  end
end
