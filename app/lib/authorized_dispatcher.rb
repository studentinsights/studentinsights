# Dispatches different questions about authorization
# to specific methods for specific models.
class AuthorizedDispatcher
  def initialize(authorizer)
    @authorizer = authorizer
  end

  # Branches by type (Relation, Array, Model)
  # and by the Model class.
  def dispatch(&block)
    return_value = block.call

    # Can't duck type here, since other things like hashes
    # are iterable or mappable in ways we don't want to
    # support.
    if return_value.class < ActiveRecord::Relation # if subclass
      filter_relation(return_value)
    elsif return_value.class == Array
      filter_array(return_value)
    else
      filter_model(return_value)
    end
  end

  private
  # This is a seam to optimize for authorization filtering
  # that stays lazy when possible (only possible when
  # authorization can be applied with simple `where`
  # clauses and not by filtering based on a Ruby method.
  def filter_relation(relation)
    # This checks that the relation has all fields required for authorization,
    # and adds them in if not.  The developer was probably trying to optimize the
    # query, and we can adjust it a bit to get what we need for authorization.
    # So we do that and continue.
    if relation.klass == Student
      relation_with_required_fields = relation.select(*Authorizer.student_fields_for_authorization)
      filter_array(relation_with_required_fields.to_a)
    else
      filter_array(relation.to_a)
    end
  end

  def filter_array(array)
    array.map {|model| filter_model(model) }.compact
  end

  def filter_model(model)
    if model.class == Student
      check_value(model, @authorizer.is_authorized_for_student?(model))
    elsif model.class == EventNote
      check_value(model, @authorizer.is_authorized_for_note?(model))
    elsif model.class == TransitionNote
      check_value(model, @authorizer.is_authorized_for_note?(model))
    else
      unchecked_value(model)
    end
  end

  # Just a hook for logging, noop
  def check_value(model, should_allow)
    if should_allow then model else nil end
  end

  # This can log, raise or otherwise notifier developers.
  # If it does return, it should return the "null" value for something
  # the educator doesn't have access to.
  def unchecked_value(model)
    message = "Authorized#unchecked_value for class: #{model.class.to_s}"
    raise Exceptions::EducatorNotAuthorized.new(message)
  end
end
