require 'rails_helper'

RSpec.describe CsvTransformer do

  describe '#transform' do
    context 'with good data' do
      context 'headers in csv' do
        let!(:file) { File.open("#{Rails.root}/spec/fixtures/fake_behavior_export.txt") }
        let(:headers_symbols) {[:local_id,:school_local_id,:assessment_date,:assessment_scale_score,:assessment_performance_level,:assessment_growth,:assessment_name,:assessment_subject,:assessment_test]}
        let(:transformer) { CsvTransformer.new }
        let(:output) { transformer.transform(file) }
        it 'returns a CSV' do
          expect(output).to be_a_kind_of CSV::Table
        end
        it 'has the correct headers' do
          expect(output.headers).to match_array(headers_symbols)
        end
      end
      context 'headers not in csv' do
        let!(:file) { File.open("#{Rails.root}/spec/fixtures/fake_no_headers.csv") }
        let(:headers) {["section_number","student_local_id","school_local_id","course_number","term_local_id","grade"]}
        let(:headers_symbols) {[:section_number,:student_local_id,:school_local_id,:course_number,:term_local_id,:grade]}
        let(:transformer) { CsvTransformer.new(headers:headers) }
        let(:output) { transformer.transform(file) }
        it 'returns a CSV' do
          expect(output).to be_a_kind_of CSV::Table
        end
        it 'has the correct headers' do
          expect(output.headers).to match_array(headers_symbols)
        end
      end
    end
  end
end
