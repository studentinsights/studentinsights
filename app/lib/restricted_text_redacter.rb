# Ensures that text for objects like restricted notes don't get accidentally
# serialized without explicitly asking for them.  This ensures that the text for
# restricted notes will always be redacted by default, regardless of the user,
# unless the developer's code explicitly asks for a restricted value.

# See also EventNote#as_json, EventNoteRevision#as_json, etc.
class RestrictedTextRedacter
  # This is shown in place of restricted text, when redacting.
  TEXT_WHEN_REDACTED = '<redacted>'

  def redacted_as_json(super_json:, restricted_key:, is_restricted:, as_json_options:)
    # safe to serialize if this isn't restricted
    if !is_restricted
      return super_json
    end

    # safe if the caller isn't serializing the restricted text content
    if !super_json.has_key?(restricted_key)
      return super_json
    end

    # safe only if the developer explicitly asked for restricted text to be included
    if as_json_options[:dangerously_include_restricted_text] == true
      return super_json
    end

    # by default, redact text content
    super_json.merge(restricted_key => TEXT_WHEN_REDACTED)
  end
end
