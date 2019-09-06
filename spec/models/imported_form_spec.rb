require 'rails_helper'

RSpec.describe ImportedForm do
  let!(:pals) { TestPals.create! }

  def create_imported_form!(attrs = {})
    ImportedForm.create!({
      student_id: pals.shs_freshman_mari.id,
      educator_id: pals.shs_jodi.id,
      form_key: 'shs_what_i_want_my_teacher_to_know_mid_year',
      form_url: 'https://example.com/foo_form_url',
      form_timestamp: pals.time_now - 5.days,
      form_json: {
        "What was the high point for you in school this year so far?"=>"A high point has been my grade in Biology since I had to work a lot for it",
        "I am proud that I..."=>"Have good grades in my classes",
        "My best qualities are..."=>"helping others when they don't know how to do homework assignments",
        "My activities and interests outside of school are..."=>"cheering",
        "I get nervous or stressed in school when..."=>"I get a low grade on an assignment that I thought I would do well on",
        "I learn best when my teachers..."=>"show me each step of what I have to do"
      }
    }.merge(attrs))
  end

  describe '#as_flattened_form' do
    it 'returns expected shape' do
      imported_form = create_imported_form!()
      expect(imported_form.as_flattened_form.keys.sort).to contain_exactly(*[
        :id,
        :student_id,
        :educator_id,
        :form_title,
        :text,
        :updated_at,
        :form_key,
        :form_timestamp
      ])
      expect(imported_form.as_flattened_form.to_json).to include('shs_what_i_want_my_teacher_to_know_mid_year')
      expect(imported_form.as_flattened_form.to_json).to include('cheering')
    end

    it 'does not serialize form_url, as a defensive measure for overly permissive forms' do
      imported_form = create_imported_form!()
      expect(imported_form.as_flattened_form.has_key?(:form_url)).to eq(false)
      expect(imported_form.as_flattened_form.to_json).to_not include('https://example.com/foo_form_url')
    end
  end
end
