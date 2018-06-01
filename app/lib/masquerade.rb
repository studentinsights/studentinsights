class Masquerade
  def initialize(controller)
    @controller = controller
    @session_key = 'masquerade.masquerading_educator_id'
  end

  def can_set?
    actual_current_educator = @controller.current_educator(super: true)
    actual_current_educator.present? && actual_current_educator.can_set_districtwide_access?
  end

  def is_masquerading?
    @controller.session.has_key?(@session_key)
  end

  def set_educator_id!(masquerading_educator_id)
    return unless can_set?
    @controller.session[@session_key] = masquerading_educator_id
    nil
  end

  def clear!
    return unless can_set?
    @controller.session.delete(@session_key)
    nil
  end

  def current_educator
    return nil unless can_set?
    return nil unless is_masquerading?
    Educator.find(@controller.session[@session_key])
  end
end
