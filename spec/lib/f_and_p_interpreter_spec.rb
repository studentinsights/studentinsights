require 'rails_helper'

RSpec.describe FAndPInterpreter do
  describe '#interpret_f_and_p_english' do
    it 'works' do
      f_and_p = FAndPInterpreter.new
      expect(f_and_p.interpret_f_and_p_english(nil)).to eq nil
      expect(f_and_p.interpret_f_and_p_english('')).to eq nil
      expect(f_and_p.interpret_f_and_p_english('aa')).to eq 'AA'
      expect(f_and_p.interpret_f_and_p_english('a')).to eq 'A'
      expect(f_and_p.interpret_f_and_p_english('A')).to eq 'A'
      expect(f_and_p.interpret_f_and_p_english('A?')).to eq 'A'
      expect(f_and_p.interpret_f_and_p_english('A+')).to eq 'A'
      expect(f_and_p.interpret_f_and_p_english('A +')).to eq 'A'
      expect(f_and_p.interpret_f_and_p_english('Z+')).to eq 'Z' # // Z+ is actually a special case per F&P levels docs, but we're ignoring it for now
      expect(f_and_p.interpret_f_and_p_english('A/B')).to eq 'A'
      expect(f_and_p.interpret_f_and_p_english('A/ B')).to eq 'A'
      expect(f_and_p.interpret_f_and_p_english('a-B')).to eq 'A'
      expect(f_and_p.interpret_f_and_p_english('a - B')).to eq 'A'
      expect(f_and_p.interpret_f_and_p_english('A (indep.)')).to eq 'A'
      expect(f_and_p.interpret_f_and_p_english('a(independent)')).to eq 'A'
      expect(f_and_p.interpret_f_and_p_english('a (instructional)')).to eq 'A'
      expect(f_and_p.interpret_f_and_p_english('C(instructional), independent(B)')).to eq nil
      expect(f_and_p.interpret_f_and_p_english('B(independent), instructional(C)')).to eq nil
      expect(f_and_p.interpret_f_and_p_english('C(instructional), B (independent)')).to eq nil
      expect(f_and_p.interpret_f_and_p_english('C(instructional) - B (independent)')).to eq nil
    end
  end

  describe '#ordering' do
    it 'works' do
      f_and_p = FAndPInterpreter.new
      manually_ordered = [
        f_and_p.ordering(nil),
        f_and_p.ordering(''),
        f_and_p.ordering('B(independent), instructional(C)'),
        f_and_p.ordering('C(instructional), independent(B)'),
        f_and_p.ordering('C(instructional), B (independent)'),
        f_and_p.ordering('C(instructional) - B (independent)'),
        f_and_p.ordering('NR'),
        f_and_p.ordering('A'),
        f_and_p.ordering('a'),
        f_and_p.ordering('a'),
        f_and_p.ordering('A'),
        f_and_p.ordering('A?'),
        f_and_p.ordering('A+'),
        f_and_p.ordering('A +'),
        f_and_p.ordering('A/B'),
        f_and_p.ordering('A/ B'),
        f_and_p.ordering('a-B'),
        f_and_p.ordering('a - B'),
        f_and_p.ordering('A (indep.)'),
        f_and_p.ordering('a(independent)'),
        f_and_p.ordering('a (instructional)'),
        f_and_p.ordering('C'),
        f_and_p.ordering('F'),
        f_and_p.ordering('Z+') # Z+ is actually a special case per F&P levels docs, but we're ignoring for now
      ]
      expect(manually_ordered).to eq manually_ordered.sort()
    end
  end
end
