require 'rails_helper'

RSpec.describe EducatorsImporter do
  # Preserve global app config
  before { @district_key = ENV['DISTRICT_KEY'] }
  after { ENV['DISTRICT_KEY'] = @district_key }

  let!(:log) { LogHelper::FakeLog.new }
  def make_educators_importer(options = {})
    EducatorsImporter.new(options: {
      school_scope: nil,
      log: log
    }.merge(options))
  end

  describe '#import integration tests' do
    let!(:pals) { TestPals.create! }

    def make_test_row(attrs = {})
      {
        login_name: 'ntufts',
        state_id: '10002',
        local_id: 'local123',
        full_name: 'Tufts, Nathan',
        staff_type: 'Teacher',
        homeroom: 'HEA 890',
        school_local_id: 'HEA'
      }.merge(attrs)
    end

    it 'does not delete records' do
      importer = make_educators_importer
      allow(importer).to receive(:download_csv).and_return([make_test_row])
      importer.import
      expect(importer.instance_variable_get(:@educator_syncer).stats[:destroyed_records_count]).to eq 0
      expect(importer.instance_variable_get(:@homeroom_syncer).stats[:destroyed_records_count]).to eq 0
    end

    it 'counts skipped_from_school_filter when row is for another school' do
      importer = make_educators_importer(school_scope: ['SHS'])
      allow(importer).to receive(:download_csv).and_return([make_test_row])
      importer.import
      expect(log.output).to include('@skipped_from_school_filter: 1')
    end

    it 'creates both Educator and Homeroom records' do
      importer = make_educators_importer
      allow(importer).to receive(:download_csv).and_return([make_test_row])
      importer.import
      expect(importer.instance_variable_get(:@educator_syncer).stats[:created_rows_count]).to eq 1
      expect(importer.instance_variable_get(:@homeroom_syncer).stats[:created_rows_count]).to eq 1
    end

    it 'can create an Educator and update an existing Homeroom record to point to it' do
      homeroom = Homeroom.create!(name: 'HEA 001', school: pals.healey, educator: nil)
      test_row = make_test_row(homeroom: 'HEA 001', local_id: '321321')
      importer = make_educators_importer
      allow(importer).to receive(:download_csv).and_return([test_row])
      importer.import

      expect(importer.instance_variable_get(:@educator_syncer).stats[:created_rows_count]).to eq 1
      expect(importer.instance_variable_get(:@homeroom_syncer).stats[:updated_rows_count]).to eq 1
      expect(Educator.find_by_local_id('321321').homeroom.id).to eq homeroom.id
    end

    it 'does nothing if no changes needed' do
      # The process for mapping the `login_name` in the row to an Educator
      # `email` varies `PerDistrict` so mock it to work with `TestPals` fixture data.
      mock_per_district = PerDistrict.new
      allow(mock_per_district).to receive(:from_educator_row_to_email).and_return(pals.healey_sarah_teacher.email)
      allow(PerDistrict).to receive(:new).and_return(mock_per_district)

      # Make an input row that matches the Educator record (to prove import
      # doesn't change anything when the row matches exactly).
      test_row = make_test_row({
        login_name: 'sarah',
        state_id: pals.healey_sarah_teacher.state_id,
        local_id: pals.healey_sarah_teacher.local_id,
        full_name: pals.healey_sarah_teacher.full_name,
        staff_type: pals.healey_sarah_teacher.staff_type,
        homeroom: pals.healey_fifth_homeroom.name,
        school_local_id: pals.healey.local_id
      })
      importer = make_educators_importer
      allow(importer).to receive(:download_csv).and_return([test_row])
      expect { importer.import }.to change { Educator.count }.by(0).and change { Homeroom.count }.by(0)

      expect(importer.instance_variable_get(:@educator_syncer).stats[:unchanged_rows_count]).to eq 1
      expect(importer.instance_variable_get(:@homeroom_syncer).stats[:unchanged_rows_count]).to eq 1
    end
  end

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
              make_educators_importer.send(:import_row, row)
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
                expect { make_educators_importer.send(:import_row, row) }.to change(Educator, :count).by 1
              end

              it 'sets the attributes correctly' do
                make_educators_importer.send(:import_row, row)
                educator = Educator.last
                expect(educator.full_name).to eq("Young, Jenny")
                expect(educator.state_id).to eq("500")
                expect(educator.admin).to eq(false)
                expect(educator.schoolwide_access).to eq(false)
                expect(educator.email).to eq("jyoung@k12.somerville.ma.us")
              end

              it 'sets the attributes correctly, PerDistrict' do
                ENV['DISTRICT_KEY'] = PerDistrict::NEW_BEDFORD
                make_educators_importer.send(:import_row, row)
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
                  importer = make_educators_importer
                  expect {
                    importer.send(:import_row, row)
                    importer.send(:import_row, another_row)
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
                make_educators_importer.send(:import_row, row)
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
            make_educators_importer.send(:import_row, row)
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
          expect { make_educators_importer.send(:import_row, row) }.to change(Educator, :count).by 0
        end
        it 'updates the educator attributes' do
          make_educators_importer.send(:import_row, row)
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
          expect { make_educators_importer.send(:import_row, row) }.to change(Educator, :count).by 0
        end

        it 'does not revoke the schoolwide access, restricted notes access' do
          make_educators_importer.send(:import_row, row)
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
          expect { make_educators_importer.send(:import_row, row) }.to change(Educator, :count).by 0
        end
      end
    end

  end

  describe 'update homeroom' do
    let!(:school) { FactoryBot.create(:healey) }

    context 'row with homeroom name' do
      let(:row) {
        {
          login_name: 'jyoung',
          school_local_id: 'HEA',
          homeroom: 'HEA 100',
          full_name: 'Young, Jenny',
          state_id: '500',
        }
      }

      context 'name of homeroom that exists' do
        let!(:homeroom) {
          Homeroom.create!(name: 'HEA 100', school: school)
        }

        it 'assigns the homeroom to the educator' do
          make_educators_importer.send(:import_row, row)
          expect(Educator.last.homeroom).to eq homeroom
        end
      end

      context 'name of homeroom that does not exist' do
        it 'raises an error' do
          expect { make_educators_importer.send(:import_row, row) }.to_not raise_error
        end
      end
    end
  end
end
