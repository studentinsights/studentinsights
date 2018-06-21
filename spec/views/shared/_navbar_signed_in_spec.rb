require "spec_helper"

describe '_navbar_signed_in partial' do
  let!(:pals) { TestPals.create! }

  def expect_common_links(rendered)
    expect(rendered).to include('My notes')
    expect(rendered).to include('My students')
    expect(rendered).to include('Search for student:')
    expect(rendered).to include('Sign Out')
  end

  it 'works for Uri' do
    render partial: 'shared/navbar_signed_in', :locals => { educator: pals.uri }
    expect(rendered).to include('District')
    expect(rendered).not_to include('Roster')
    expect(rendered).not_to include('Absences')
    expect(rendered).not_to include('Tardies')
    expect(rendered).not_to include('Sections')
    expect(rendered).not_to include('Homeroom')
    expect_common_links(rendered)
  end

  it 'works for Vivian' do
    render partial: 'shared/navbar_signed_in', :locals => { educator: pals.healey_vivian_teacher }
    expect(rendered).not_to include('District')
    expect(rendered).not_to include('Roster')
    expect(rendered).not_to include('Absences')
    expect(rendered).not_to include('Tardies')
    expect(rendered).not_to include('Sections')
    expect(rendered).to include('Homeroom')
    expect_common_links(rendered)
  end

  it 'works for Laura' do
    render partial: 'shared/navbar_signed_in', :locals => { educator: pals.healey_laura_principal }
    expect(rendered).not_to include('District')
    expect(rendered).to include('Roster')
    expect(rendered).to include('Absences')
    expect(rendered).to include('Tardies')
    expect(rendered).not_to include('Sections')
    expect(rendered).not_to include('Homeroom')
    expect_common_links(rendered)
  end

  it 'works for Bill' do
    render partial: 'shared/navbar_signed_in', :locals => { educator: pals.shs_bill_nye }
    expect(rendered).not_to include('District')
    expect(rendered).not_to include('Roster')
    expect(rendered).not_to include('Absences')
    expect(rendered).not_to include('Tardies')
    expect(rendered).to include('Sections')
    expect(rendered).not_to include('Homeroom')
    expect_common_links(rendered)
  end
end
