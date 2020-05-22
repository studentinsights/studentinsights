require 'spec_helper'

RSpec.describe PathsForEducator do
  let!(:pals) { TestPals.create! }

  def navbar_links(educator)
    PathsForEducator.new(educator).navbar_links
  end

  def mock_allow_sections_link!(value)
    mock_per_district = PerDistrict.new
    allow(mock_per_district).to receive(:allow_sections_link?).and_return(value)
    allow(PerDistrict).to receive(:new).and_return(mock_per_district)
  end

  describe '#navbar_links' do
    context 'when SHOW_LINK_FOR_CLASS_LISTS disabled' do
      before { @show_link_for_class_lists = ENV['SHOW_LINK_FOR_CLASS_LISTS'] }
      before { ENV['SHOW_LINK_FOR_CLASS_LISTS'] = nil }
      after { ENV['SHOW_LINK_FOR_CLASS_LISTS'] = @show_link_for_class_lists }

      it 'does not show link to /classlists' do
        expect(navbar_links(pals.uri)).to eq({
          district: '/district',
          levels_shs: '/levels/shs'
        })
      end
    end

    context 'when ENABLE_CLASS_LISTS disabled' do
      before { @enable_class_lists = ENV['ENABLE_CLASS_LISTS'] }
      before { ENV['ENABLE_CLASS_LISTS'] = nil }
      after { ENV['ENABLE_CLASS_LISTS'] = @enable_class_lists }

      it 'respects PerDistrict for /classlists' do
        expect(navbar_links(pals.uri)).to eq({
          district: '/district',
          levels_shs: '/levels/shs'
        })
      end
    end

    context 'when #allow_sections_link? mocked' do
      it 'includes sections link for Bill' do
        mock_allow_sections_link!(true)
        expect(navbar_links(pals.shs_bill_nye)).to eq({
          levels_shs: '/levels/shs',
          section: '/educators/my_sections'
        })
      end

      it 'does NOT include sections link for Bill' do
        mock_allow_sections_link!(false)
        expect(navbar_links(pals.shs_bill_nye)).to eq({
          levels_shs: '/levels/shs'
        })
      end
    end

    context 'with all feature switches enabled' do
      it 'works across educators, with classlists enabled' do
        expect(navbar_links(pals.uri)).to eq({
          district: '/district',
          classlists: '/classlists',
          levels_shs: '/levels/shs'
        })

        # healey
        expect(navbar_links(pals.healey_laura_principal)).to eq({
          classlists: '/classlists',
          school: '/schools/hea',
          absences: '/schools/hea/absences',
          tardies: '/schools/hea/tardies',
          discipline: '/schools/hea/discipline'
        })
        expect(navbar_links(pals.healey_ell_teacher)).to eq({})
        expect(navbar_links(pals.healey_sped_teacher)).to eq({})
        expect(navbar_links(pals.healey_vivian_teacher)).to eq({
          classlists: '/classlists',
          homeroom: "/homerooms/#{pals.healey_kindergarten_homeroom.id}"
        })
        expect(navbar_links(pals.healey_sarah_teacher)).to eq({
          classlists: '/classlists'
          # no homeroom, because no active students
        })

        # west
        expect(navbar_links(pals.west_marcus_teacher)).to eq({
          classlists: '/classlists',
          # no homeroom, because no active students
        })

        # high school (TestPals doesn't match actual production HS roles and permisssions)
        expect(navbar_links(pals.shs_harry_housemaster)).to eq({
          levels_shs: '/levels/shs',
          school: '/schools/shs',
          absences: '/schools/shs/absences',
          tardies: '/schools/shs/tardies',
          discipline: '/schools/shs/discipline'
        })
        expect(navbar_links(pals.shs_jodi)).to eq({
          levels_shs: '/levels/shs'
        })
        expect(navbar_links(pals.shs_sofia_counselor)).to eq({
          levels_shs: '/levels/shs',
          counselor_meetings: '/counselors/meetings',
          school: '/schools/shs',
          absences: '/schools/shs/absences',
          tardies: '/schools/shs/tardies',
          discipline: '/schools/shs/discipline'
        })
        expect(navbar_links(pals.shs_bill_nye)).to eq({
          levels_shs: '/levels/shs',
          section: '/educators/my_sections'
        })
        expect(navbar_links(pals.shs_hugo_art_teacher)).to eq({
          levels_shs: '/levels/shs',
          section: '/educators/my_sections'
        })
        expect(navbar_links(pals.shs_fatima_science_teacher)).to eq({
          levels_shs: '/levels/shs',
          absences: '/schools/shs/absences',
          school: '/schools/shs',
          section: '/educators/my_sections',
          tardies: '/schools/shs/tardies',
          discipline: '/schools/shs/discipline'
        })
      end
    end
  end
end
