require 'rails_helper'

RSpec.describe ResearchMattersExporter do
  before { School.seed_somerville_schools }
  let!(:school) { School.find_by_name('Arthur D Healey') }
  let!(:educator) { FactoryGirl.create(:educator, :admin, school: school, full_name: 'Khamar, Matsay', email: 'matsay@demo.studentinsights.org') }
  let!(:homeroom) { Homeroom.create(name: 'HEA 300', grade: '3', school: school, educator: educator) }
  let!(:student) { FactoryGirl.create(:student, homeroom: homeroom, school: school) }

  class FakeMixpanelDownloader
    def initialize(event_data)
      @event_data = event_data
    end

    def event_data
      @event_data
    end
  end

  let(:exporter) {
    described_class.new(options: {
      mixpanel_downloader: FakeMixpanelDownloader.new(event_data),
      canonical_domain: 'somerville-teacher-tool-demo.herokuapp.com'
    })
  }

  describe '#student_file' do
    context 'no mixpanel page views' do
      let(:event_data) {
        [{
          "event"=>"PAGE_VISIT",
          "properties"=>{
            "time"=>1503905237,
            "$current_url"=>"https://somerville-teacher-tool-demo.herokuapp.com/students/junk_id",
            "deployment_key"=>"production",
            "educator_id"=>1,
            "educator_is_admin"=>false,
            "educator_school_id"=>1,
            "isDemoSite"=>false,
            "page_key"=>"STUDENT_PROFILE"
          }
        }]
      }

      context 'no notes' do
        it 'outputs the right file' do
          expect(exporter.student_file).to eq([
            "student_id,school_id,absence_indicator,discipline_indicator,sst_indicator,notes_added,notes_revised,notes_total,educator_id,educator_count,pageview_count",
            "#{student.id},HEA,0,0,0,0,0,0,#{educator.id},1,0"
          ])
        end
      end

      context 'notes during the focal period' do
        let!(:event_note) {
          FactoryGirl.create(:event_note, student: student, recorded_at: DateTime.new(2017, 12, 22), event_note_type_id: 300)
        }
        let!(:another_event_note) {
          FactoryGirl.create(:event_note, student: student, recorded_at: DateTime.new(2017, 12, 20), event_note_type_id: 300)
        }

        it 'outputs the right file' do
          expect(exporter.student_file).to eq([
            "student_id,school_id,absence_indicator,discipline_indicator,sst_indicator,notes_added,notes_revised,notes_total,educator_id,educator_count,pageview_count",
            "#{student.id},HEA,0,0,0,2,0,2,#{educator.id},1,0"
          ])
        end
      end

      context 'notes outside the focal period' do
        let!(:event_note) {
          FactoryGirl.create(:event_note, student: student, recorded_at: DateTime.new(2017, 12, 22), event_note_type_id: 300)
        }
        let!(:another_event_note) {
          FactoryGirl.create(:event_note, student: student, recorded_at: DateTime.new(2017, 12, 20), event_note_type_id: 300)
        }
        let!(:outside_event_note) {
          FactoryGirl.create(:event_note, student: student, recorded_at: DateTime.new(2016, 12, 20), event_note_type_id: 300)
        }

        it 'outputs the right file, does not count the notes outside the focal period' do
          expect(exporter.student_file).to eq([
            "student_id,school_id,absence_indicator,discipline_indicator,sst_indicator,notes_added,notes_revised,notes_total,educator_id,educator_count,pageview_count",
            "#{student.id},HEA,0,0,0,2,0,2,#{educator.id},1,0"
          ])
        end
      end

      context 'notes and revision during the focal period' do
        let!(:event_note) {
          FactoryGirl.create(:event_note, student: student, recorded_at: DateTime.new(2017, 12, 18), event_note_type_id: 300)
        }
        let!(:another_event_note) {
          FactoryGirl.create(:event_note, student: student, recorded_at: DateTime.new(2017, 12, 20), event_note_type_id: 300)
        }
        let!(:event_note_revision) {
          FactoryGirl.create(:event_note_revision, event_note: event_note, student_id: student.id, created_at: DateTime.new(2017, 12, 21), event_note_type_id: 300, educator: educator)
        }

        it 'outputs the right file' do
          expect(exporter.student_file).to eq([
            "student_id,school_id,absence_indicator,discipline_indicator,sst_indicator,notes_added,notes_revised,notes_total,educator_id,educator_count,pageview_count",
            "#{student.id},HEA,0,0,0,2,1,3,#{educator.id},1,0"
          ])
        end
      end
    end

    context 'mixpanel page view: student profile' do
      let(:event_data) {
        [{
          "event"=>"PAGE_VISIT",
          "properties"=>{
            "time"=>1503905237,
            "$current_url"=>"https://somerville-teacher-tool-demo.herokuapp.com/students/#{student.id}",
            "deployment_key"=>"production",
            "educator_id"=>89898989,
            "educator_is_admin"=>false,
            "educator_school_id"=>1,
            "isDemoSite"=>false,
            "page_key"=>"STUDENT_PROFILE"
          }
        }]
      }

      it 'shows the pageview' do
        expect(exporter.student_file).to eq([
          "student_id,school_id,absence_indicator,discipline_indicator,sst_indicator,notes_added,notes_revised,notes_total,educator_id,educator_count,pageview_count",
          "#{student.id},HEA,0,0,0,0,0,0,#{educator.id},1,1"
        ])
      end
    end

    context 'mixpanel page view: a different page' do
      let(:event_data) {
        [{
          "event"=>"PAGE_VISIT",
          "properties"=>{
            "time"=>1503905237,
            "$current_url"=>"https://somerville-teacher-tool-demo.herokuapp.com/students/#{student.id}",
            "deployment_key"=>"production",
            "educator_id"=>89898989,
            "educator_is_admin"=>false,
            "educator_school_id"=>1,
            "isDemoSite"=>false,
            "page_key"=>"DIFFERENT_PAGE"
          }
        }]
      }

      it 'shows the pageview' do
        expect(exporter.student_file).to eq([
          "student_id,school_id,absence_indicator,discipline_indicator,sst_indicator,notes_added,notes_revised,notes_total,educator_id,educator_count,pageview_count",
          "#{student.id},HEA,0,0,0,0,0,0,#{educator.id},1,0"
        ])
      end
    end
  end

  describe '#teacher_file' do
    context 'teacher name present' do
      let(:event_data) { [] }

      context 'teacher has no mixpanel pageviews' do

        context 'no teacher event notes' do
          it 'outputs the right file' do
            expect(exporter.teacher_file).to eq([
              "educator_id,email,first_name,last_name,school_id,notes_added,notes_revised,notes_total,pageview_count",
              "#{educator.id},matsay@demo.studentinsights.org,Matsay,Khamar,HEA,0,0,0,0"
            ])
          end
        end

        context 'teacher has event notes' do
          let!(:educator_event_note) {
            FactoryGirl.create(:event_note, educator: educator)
          }

          it 'outputs the right file' do
            expect(exporter.teacher_file).to eq([
              "educator_id,email,first_name,last_name,school_id,notes_added,notes_revised,notes_total,pageview_count",
              "#{educator.id},matsay@demo.studentinsights.org,Matsay,Khamar,HEA,1,0,1,0"
            ])
          end
        end
      end

      context 'teacher has 2 mixpanel pageviews' do
        let(:event_data) {
          [{
            "event"=>"PAGE_VISIT",
            "properties"=>{
              "time"=>1503905237,
              "$current_url"=>"https://somerville-teacher-tool-demo.herokuapp.com/students/#{student.id}",
              "deployment_key"=>"production",
              "educator_id"=>"#{educator.id}",
              "educator_is_admin"=>false,
              "educator_school_id"=>1,
              "isDemoSite"=>false,
              "page_key"=>"STUDENT_PROFILE"
            }
          },
          {
            "event"=>"PAGE_VISIT",
            "properties"=>{
              "time"=>1503905287,
              "$current_url"=>"https://somerville-teacher-tool-demo.herokuapp.com/students/#{student.id}",
              "deployment_key"=>"production",
              "educator_id"=>"#{educator.id}",
              "educator_is_admin"=>false,
              "educator_school_id"=>1,
              "isDemoSite"=>false,
              "page_key"=>"STUDENT_PROFILE"
            }
          }]
        }

        it 'outputs the right file' do
          expect(exporter.teacher_file).to eq([
            "educator_id,email,first_name,last_name,school_id,notes_added,notes_revised,notes_total,pageview_count",
            "#{educator.id},matsay@demo.studentinsights.org,Matsay,Khamar,HEA,0,0,0,2"
          ])
        end
      end
    end

    context 'teacher name missing' do
      let(:event_data) { [] }
      let!(:another_educator) {
        FactoryGirl.create(:educator,
          :admin, school: school, email: 'noname@demo.studentinsights.org')
      }

      it 'outputs the right file' do
        expect(exporter.teacher_file).to eq([
          "educator_id,email,first_name,last_name,school_id,notes_added,notes_revised,notes_total,pageview_count",
          "#{educator.id},matsay@demo.studentinsights.org,Matsay,Khamar,HEA,0,0,0,0",
          "#{another_educator.id},noname@demo.studentinsights.org,,,HEA,0,0,0,0",
        ])
      end
    end
  end
end
