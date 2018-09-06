# For tagging educators with particular labels (eg, for
# membership into different educators cohorts like NGE).
class EducatorLabel < ActiveRecord::Base
  belongs_to :educator
  validates :educator, presence: true
  validates :label_key, {
    presence: true,
    uniqueness: { scope: [:label_key, :educator] },
    inclusion: {
      in: [
        'shs_experience_team', # deprecated
        'k8_counselor',
        'high_school_house_master',
        'class_list_maker_finalizer_principal',
        'use_counselor_based_feed',
        'enable_class_lists_override',
        'can_upload_student_voice_surveys'
      ]
    }
  }

  # Static labels are set by records in the database.  Dynamic labels are
  # computed at read time here based on some other property of the educator.
  def self.labels(educator)
    static_labels = educator.educator_labels.map(&:label_key)
    dynamic_labels = self.dynamic_labels_for_educator(educator)

    static_labels + dynamic_labels
  end

  def self.dynamic_labels_for_educator(educator)
    dynamic_labels = []

    authorizer = Authorizer.new(educator)
    authorized_sections = educator.sections.select do |section|
      authorizer.is_authorized_for_section?(section)
    end
    if authorized_sections.size > 0 && educator.school.is_high_school?
      dynamic_labels << 'should_show_low_grades_box'
    end

    dynamic_labels
  end

  def self.has_static_label?(educator_id, label_key)
    EducatorLabel.find_by(educator_id: educator_id, label_key: label_key).present?
  end
end
