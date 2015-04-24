module ResultPresenter
  
  def method_missing(m, *args, &block) 
    if results_for_presentation.include? m 
      result.send(m).present? ? result.send(m) : "—"
    else
      raise NoMethodError
    end
  end

end