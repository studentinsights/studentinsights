require 'rails_helper'

RSpec.describe EducatorsImporter do
  # Preserve global app config
  before { @district_key = ENV['DISTRICT_KEY'] }
  after { ENV['DISTRICT_KEY'] = @district_key }

  let(:log) { LogHelper::Redirect.instance.file }
  let(:educators_importer) {
    described_class.new(options: {
      school_scope: nil, log: log
    })
  }

  describe '#import_row' do
    let!(:school) { FactoryBot.create(:healey) }

    context 'good row' do

      context 'new educator' do

        context 'non-administrator' do

          context 'without homeroom' do
            let(:row) {
              { state_id: "500", full_name: "Young, Jenny",
                login_name: "jyoung", school_local_id: "HEA" }
            }

            before do
              educators_importer.import_row(row)
            end

            it 'creates an educator' do
              expect(Educator.count).to eq(1)
            end
            it 'does not give educator school wide access' do
              expect(Educator.first.schoolwide_access).to eq false
            end
            it 'does not give educator a homeroom' do
              expect(Educator.first.homeroom).to eq nil
            end
            it 'cannot view restricted notes' do
              expect(Educator.first.can_view_restricted_notes).to eq false
            end
          end

          context 'with homeroom' do
            let(:homeroom) { FactoryBot.create(:homeroom) }
            let(:homeroom_name) { homeroom.name }

            context 'without school local id' do
              let(:row) {
                {
                  state_id: "500",
                  full_name: "Young, Jenny",
                  login_name: "jyoung",
                  homeroom: homeroom_name,
                  school_local_id: "HEA"
                }
              }
              it 'creates an educator' do
                expect { educators_importer.import_row(row) }.to change(Educator, :count).by 1
              end

              it 'sets the attributes correctly' do
                educators_importer.import_row(row)
                educator = Educator.last
                expect(educator.full_name).to eq("Young, Jenny")
                expect(educator.state_id).to eq("500")
                expect(educator.admin).to eq(false)
                expect(educator.schoolwide_access).to eq(false)
                expect(educator.email).to eq("jyoung@k12.somerville.ma.us")
              end

              it 'sets the attributes correctly, PerDistrict' do
                ENV['DISTRICT_KEY'] = PerDistrict::NEW_BEDFORD
                educators_importer.import_row(row)
                educator = Educator.last
                expect(educator.email).to eq('jyoung@newbedfordschools.org')
              end

              context 'multiple educators' do
                let(:another_homeroom) { FactoryBot.create(:homeroom) }
                let(:another_homeroom_name) { another_homeroom.name }
                let(:another_row) {
                  {
                    state_id: "501",
                    full_name: "Gardner, Dylan",
                    login_name: "dgardner",
                    homeroom: another_homeroom_name,
                    school_local_id: "HEA"
                  }
                }
                it 'creates multiple educators' do
                  expect {
                    educators_importer.import_row(row)
                    educators_importer.import_row(another_row)
                  }.to change(Educator, :count).by 2
                end
              end
            end

            context 'with school local ID' do
              let(:row) {
                {
                  state_id: "500",
                  full_name: "Young, Jenny",
                  login_name: "jyoung",
                  homeroom: homeroom_name,
                  school_local_id: "HEA"
                }
              }

              it 'assigns the educator to the correct school' do
                educators_importer.import_row(row)
                educator = Educator.last
                expect(educator.school).to eq(school)
              end
            end
          end
        end

        context 'administrator' do
          let(:row) {
            {
              local_id: "300",
              full_name: "Hill,
              Marian", staff_type:
              "Administrator",
              login_name: "mhill",
              school_local_id: "HEA"
            }
          }

          it 'sets the administrator attributes correctly' do
            educators_importer.import_row(row)
            educator = Educator.last
            expect(educator.admin).to eq(true)
            expect(educator.can_view_restricted_notes).to eq true
          end
        end
      end

      context 'existing educator' do
        let(:homeroom) { FactoryBot.create(:homeroom) }
        let(:homeroom_name) { homeroom.name }
        let!(:educator) { FactoryBot.create(:educator, email: 'jyoung@k12.somerville.ma.us') }
        let(:row) {
          {
            state_id: "500", full_name: "Young, Jenny",
            login_name: "jyoung", homeroom: homeroom_name, school_local_id: "HEA"
          }
        }

        it 'does not create an educator' do
          expect { educators_importer.import_row(row) }.to change(Educator, :count).by 0
        end
        it 'updates the educator attributes' do
          educators_importer.import_row(row)
          educator = Educator.last
          expect(educator.full_name).to eq("Young, Jenny")
          expect(educator.state_id).to eq("500")
        end
      end

      context 'existing non-admin educator with schoolwide access, restricted notes access' do
        let!(:educator) {
          FactoryBot.create(
            :educator,
            schoolwide_access: true,
            can_view_restricted_notes: true,
            email: 'aqsoble@k12.somerville.ma.us'
          )
        }
        let(:row) {
          {
            state_id: "1", full_name: "Soble, Alex.",
            email: 'aqsoble@k12.somerville.ma.us',
            login_name: "aqsoble", school_local_id: "HEA"
          }
        }

        it 'does not create a new educator' do
          expect { educators_importer.import_row(row) }.to change(Educator, :count).by 0
        end

        it 'does not revoke the schoolwide access, restricted notes access' do
          educators_importer.import_row(row)
          educator = Educator.last
          expect(educator.schoolwide_access).to eq(true)
          expect(educator.can_view_restricted_notes).to eq(true)
        end
      end

    end

    context 'bad data' do
      context 'no login name' do
        let(:row) {
          { state_id: "500", full_name: "Young, Jenny" }
        }

        it 'does not create an educator' do
          expect { educators_importer.import_row(row) }.to change(Educator, :count).by 0
        end
      end
    end

  end

  describe '#update_homeroom' do
    let!(:school) { FactoryBot.create(:healey) }

    context 'row with homeroom name' do
      let(:row) {
        { state_id: "500", full_name: "Young, Jenny",
          homeroom: "HEA 100", login_name: "jyoung", school_local_id: "HEA" }
      }

      context 'name of homeroom that exists' do
        let!(:homeroom) { FactoryBot.create(:homeroom, :named_hea_100) }
        it 'assigns the homeroom to the educator' do
          educators_importer.import_row(row)
          expect(Educator.last.homeroom).to eq homeroom
        end
      end

      context 'name of homeroom that does not exist' do
        it 'raises an error' do
          expect { educators_importer.import_row(row) }.to_not raise_error
        end
      end
    end
  end
end
