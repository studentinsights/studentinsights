# Adapted from FuzzyStudentMatcher, this is just the match
# function
class FuzzyEducatorMatcher
  # full_name_text is reversed (eg, "Tweedy, Jeff")
  def fuzzy_match(full_name_text, options = {})
    distance_threshold = options.fetch(:distance_threshold, 2)
    limit = options.fetch(:limit, 3)
    educators = Arel::Table.new('educators')
    distance = Arel::Nodes::NamedFunction.new('LEVENSHTEIN', [
      educators[:full_name],
      Arel::Nodes.build_quoted(full_name_text)
    ])
    query = educators.project(
      educators[:id],
      educators[:full_name],
      distance
    ).order(distance).where(distance.lteq(distance_threshold)).take(limit)
    ActiveRecord::Base.connection.execute(query.to_sql).to_a.map do |result|
      {
        id: result['id'],
        full_name: result['full_name'],
        levenshtein: result['levenshtein']
      }
    end
  end
end
