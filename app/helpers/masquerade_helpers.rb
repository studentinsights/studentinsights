# This is intended to be mixed into `ApplicationController`, and other
# controllers that don't inherit from `ApplicationController`
# (eg, Administrate::ApplicationController).  This enables masquerading
# as another user.
module MasqueradeHelpers
  # override
  # This overrides the Devise method in order to allow masquerading
  # as another user.
  def current_educator(options = {})
    # `super: true` allows callers to get the real underlying Devise user even
    # when there is masquerading.  This should only be used in limited
    # places (eg, the code involved in setting and clearing the masquerade).
    if options.has_key?(:super) && options[:super]
      super()
    elsif masquerade.authorized? && masquerade.is_masquerading?
      masquerade.current_educator
    else
      super()
    end
  end

  # Controls masquerading as another user
  def masquerade
    @masquerade ||= Masquerade.new(session, -> { current_educator(super: true) })
  end
end
