require "spec_helper"

describe '_navbar_signed_in partial' do
  let!(:pals) { TestPals.create! }

  def render_for(educator)
    masquerade = Masquerade.new({}, -> { educator })
    render partial: 'shared/navbar_signed_in', :locals => {
      educator: educator,
      masquerade: masquerade
    }
  end

  def expect_common_links(rendered)
    expect(rendered).to include('My notes')
    expect(rendered).to include('My students')
    expect(rendered).to include('Search:')
    expect(rendered).to include('Sign Out')
  end

  it 'works for Uri' do
    render_for(pals.uri)
    expect(rendered).to include('Class lists')
    expect(rendered).to include('District')
    expect(rendered).not_to include('Absences')
    expect(rendered).not_to include('Tardies')
    expect(rendered).not_to include('Overview')
    expect(rendered).not_to include('My sections')
    expect(rendered).not_to include('Homeroom')
    expect_common_links(rendered)
  end

  it 'works for Vivian' do
    render_for(pals.healey_vivian_teacher)
    expect(rendered).to include('Class lists')
    expect(rendered).not_to include('District')
    expect(rendered).not_to include('Absences')
    expect(rendered).not_to include('Tardies')
    expect(rendered).not_to include('Overview')
    expect(rendered).not_to include('My sections')
    expect(rendered).to include('Homeroom')
    expect_common_links(rendered)
  end

  it 'works for Laura' do
    render_for(pals.healey_laura_principal)
    expect(rendered).to include('Class lists')
    expect(rendered).not_to include('District')
    expect(rendered).to include('Absences')
    expect(rendered).to include('Tardies')
    expect(rendered).to include('Overview')
    expect(rendered).not_to include('My sections')
    expect(rendered).not_to include('Homeroom')
    expect_common_links(rendered)
  end

  it 'works for Bill' do
    render_for(pals.shs_bill_nye)
    expect(rendered).not_to include('Class lists')
    expect(rendered).not_to include('District')
    expect(rendered).not_to include('Absences')
    expect(rendered).not_to include('Tardies')
    expect(rendered).not_to include('Overview')
    expect(rendered).to include('My sections')
    expect(rendered).not_to include('Homeroom')
    expect_common_links(rendered)
  end
end
