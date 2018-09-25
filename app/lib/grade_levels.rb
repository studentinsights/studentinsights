class GradeLevels
  ORDERED_GRADE_LEVELS = [
    'OOPK',
    'OPK',
    'TK',
    'PPK',
    'PK',
    'KF',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    'SP'
  ]

  def next(grade_level)
    index = ORDERED_GRADE_LEVELS.find_index(grade_level)
    if index < ORDERED_GRADE_LEVELS.size
       ORDERED_GRADE_LEVELS[index + 1]
    else
      nil
    end
  end

  def previous(grade_level)
    index = ORDERED_GRADE_LEVELS.find_index(grade_level)
    if index > 0
       ORDERED_GRADE_LEVELS[index - 1]
    else
      nil
    end
  end
end
