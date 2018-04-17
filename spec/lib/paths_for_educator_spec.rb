require 'spec_helper'

RSpec.describe PathsForEducator do
  let!(:pals) { TestPals.create! }

  def navbar_links(educator)
    PathsForEducator.new(educator).navbar_links
  end

  it '#navbar_links' do
    expect(navbar_links(pals.uri)).to eq({
      district: '/educators/districtwide'
    })

    # healey
    expect(navbar_links(pals.healey_laura_principal)).to eq({
      school: '/schools/hea',
      absences: '/schools/hea/absences',
      tardies: '/schools/hea/tardies',
    })
    expect(navbar_links(pals.healey_ell_teacher)).to eq({})
    expect(navbar_links(pals.healey_sped_teacher)).to eq({})
    expect(navbar_links(pals.healey_vivian_teacher)).to eq({
      homeroom: '/homerooms/hea-003'
    })
    expect(navbar_links(pals.healey_sarah_teacher)).to eq({
      homeroom: '/homerooms/hea-500'
    })

    # west
    expect(navbar_links(pals.west_marcus_teacher)).to eq({
      homeroom: '/homerooms/wsns-501'
    })

    # high school (TestPals doesn't match actual production HS roles and permisssions)
    expect(navbar_links(pals.shs_jodi)).to eq({})
    expect(navbar_links(pals.shs_ninth_grade_counselor)).to eq({
      school: '/schools/shs'
    })
    expect(navbar_links(pals.shs_bill_nye)).to eq({
      section: "/sections/#{pals.shs_tuesday_biology_section.id}"
    })
    expect(navbar_links(pals.shs_hugo_art_teacher)).to eq({
      section: "/sections/#{pals.shs_second_period_ceramics.id}"
    })
    expect(navbar_links(pals.shs_fatima_science_teacher)).to eq({
      section: "/sections/#{pals.shs_third_period_physics.id}"
    })
  end
end
