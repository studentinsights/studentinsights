# For tagging educators with particular labels (eg, for
# membership into different educators cohorts like NGE).
class EducatorLabel < ApplicationRecord
  belongs_to :educator
  validates :educator, presence: true
  validates :label_key, {
    presence: true,
    uniqueness: { scope: [:label_key, :educator] },
    inclusion: {
      in: [
        # deprecated
        'shs_experience_team', # deprecated
        'enable_viewing_504_data_in_profile', # deprecated

        # feed
        'use_counselor_based_feed',
        'use_housemaster_based_feed',
        'use_section_based_feed',
        'use_ell_based_feed',
        'use_community_school_based_feed',

        # reading
        'profile_enable_minimal_reading_data',
        'enable_reading_benchmark_data_entry', # deprecated
        'enable_reading_debug',

        # profile
        'enable_viewing_educators_with_access_to_student',

        # transition notes
        'k8_counselor',
        'high_school_house_master',
        'enable_transition_note_features', # Controls whether user can create new transition notes, not whether they are viewable.
        'enable_transition_note_editing',

        # class lists
        'class_list_maker_finalizer_principal',
        'enable_class_lists_override',

        # other
        'can_upload_student_voice_surveys',
        'should_show_levels_shs_link',
        'enable_searching_notes',
        'can_mark_notes_as_restricted',
        'enable_equity_experiments',
        'enable_counselor_meetings_page'
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

    # Low grades box: Anyone in SHS with sections
    authorizer = Authorizer.new(educator)
    authorized_sections = educator.sections.select do |section|
      authorizer.is_authorized_for_section?(section)
    end
    if authorized_sections.size > 0 && educator.school.is_high_school?
      dynamic_labels << 'should_show_low_grades_box'
    end

    # Levels link: Anyone at SHS (can also be added manually)
    if educator.school.present? && educator.school.local_id == 'SHS'
      dynamic_labels << 'should_show_levels_shs_link'
    end

    dynamic_labels
  end

  def self.has_static_label?(educator_id, label_key)
    EducatorLabel.find_by(educator_id: educator_id, label_key: label_key).present?
  end
end
