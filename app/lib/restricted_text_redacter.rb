# Ensures that text for objects like restricted notes don't get accidentally
# serialized without explicitly asking for them.  This ensures that the text for
# restricted notes will always be redacted by default, regardless of the user,
# unless the developer's code explicitly asks for a restricted value.

# See also EventNote#as_json, EventNoteRevision#as_json, etc.
class RestrictedTextRedacter
  # This is shown in place of restricted text, when redacting.
  TEXT_WHEN_REDACTED = '<redacted>'

  def redacted_as_json(json, restricted_json_key, is_restricted, as_json_options)
    # unrestricted notes are safe to serialize
    return json unless is_restricted

    # if a restricted note isn't serializing the text content it's okay
    return json unless json.has_key?(restricted_json_key)

    # allow a dangerous manual override
    return json if as_json_options[:dangerously_include_restricted_text]

    # redact text content
    json.merge([restricted_json_key] => TEXT_WHEN_REDACTED)
  end
end