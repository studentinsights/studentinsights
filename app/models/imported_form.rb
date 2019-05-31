# Storage mechanism for a variety of form types
class ImportedForm < ApplicationRecord
  SHS_Q2_SELF_REFLECTION = 'shs_q2_self_reflection';
  SHS_WHAT_I_WANT_MY_TEACHER_TO_KNOW_MID_YEAR = 'shs_what_i_want_my_teacher_to_know_mid_year';
  BEDFORD_END_OF_YEAR_TRANSITION_FORM = 'bedford_end_of_year_transition_one'

  belongs_to :student
  belongs_to :educator

  validates :student, presence: true
  validates :educator, presence: true
  validates :form_json, presence: true
  validates :form_timestamp, presence: true
  validates :form_url, presence: true
  validates :form_key, inclusion: {
    in: [
      SHS_Q2_SELF_REFLECTION,
      SHS_WHAT_I_WANT_MY_TEACHER_TO_KNOW_MID_YEAR,
      BEDFORD_END_OF_YEAR_TRANSITION_FORM
    ]
  }

  # This uniques by (student_id, form_key), taking the most recent
  # by (form_timestamp, updated_at, id).
  #
  # Using Arel.sql is safe for strings without user input, see https://github.com/rails/rails/issues/32995
  # for more background.
  def self.latest_uncompacted
    ImportedForm
      .select(Arel.sql 'DISTINCT ON(CONCAT(form_key, student_id)) form_key, student_id, form_timestamp, updated_at, id')
      .order(Arel.sql 'CONCAT(form_key, student_id), form_key ASC, student_id ASC, form_timestamp DESC, updated_at DESC, id DESC')
  end

  # Most recent import of most recent form_key for student
  def self.latest_for_student_id(student_id, form_key)
    ImportedForm
      .where(student_id: student_id)
      .where(form_key: form_key)
      .order('form_timestamp DESC, updated_at DESC')
      .limit(1)
      .first
  end

  # Used for whitelisting during import
  def self.prompts(form_key)
    if form_key == SHS_WHAT_I_WANT_MY_TEACHER_TO_KNOW_MID_YEAR
      [
        'What was the high point for you in school this year so far?',
        "What's something that most teachers don't know about me, but they should?",
        'I am proud that I...',
        'My best qualities are...',
        'My activities and interests outside of school are...',
        'I get nervous or stressed in school when...',
        'I learn best when my teachers...'
      ]
    elsif form_key == SHS_Q2_SELF_REFLECTION
      [
        'What classes are you doing well in?',
        'Why are you doing well in those classes?',
        'What courses are you struggling in?',
        'Why are you struggling in those courses?',
        "In the classes that you are struggling in, how can your teachers support you so that your grades, experience, work load, etc, improve?",
        "When you are struggling, who do you go to for support, encouragement, advice, etc?",
        "At the end of the quarter 3, what would make you most proud of your accomplishments in your course?",
        "What other information is important for your teachers to know so that we can support you and your learning? (For example, tutor, mentor, before school HW help, study group, etc)"
      ]
    elsif form_key == BEDFORD_END_OF_YEAR_TRANSITION_FORM
      [
        'LLI',
        'Reading Intervention (w/ specialist)',
        'Math Intervention (w/ consult from SD)',
        "Please share any specific information you want the teacher to know beyond the report card. This could include notes on interventions, strategies, academic updates that aren't documented in an IEP or 504. If information is in a file please be sure to link it here or share w/ Jess via google doc folder or paper copy",
        "Is there any key information that you wish you knew about this student in September?",
        "Please share anything that helped you connect with this student that might be helpful to the next teacher."
      ]
    end
  end

  # for rendering in UI
  def as_flattened_form
    form_title = case form_key
      when SHS_Q2_SELF_REFLECTION then 'Q2 Self-reflection'
      when SHS_WHAT_I_WANT_MY_TEACHER_TO_KNOW_MID_YEAR then 'What I want my teachers to know'
      when BEDFORD_END_OF_YEAR_TRANSITION_FORM then 'Transition Information'
      else 'Student voice survey'
    end

    {
      id: id,
      form_key: form_key,
      form_title: form_title,
      form_timestamp: form_timestamp,
      student_id: student_id,
      educator_id: educator_id,
      text: as_text,
      updated_at: updated_at
    }
  end

  private
  # flat text rendering all questions and responses in the survey
  def as_text
    prompts = ImportedForm.prompts(form_key)
    sections = prompts.flat_map do |prompt|
      response_text = form_json.fetch(prompt, nil)
      if response_text.nil?
        []
      else
        [prompt, response_text].join("\n")
      end
    end
    sections.join("\n\n")
  end
end
