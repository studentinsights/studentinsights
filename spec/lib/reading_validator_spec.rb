RSpec.describe ReadingValidator do
  describe '#validate_json_meaning' do
    def validate_json_meaning(key, value, options = {})
      validator = ReadingValidator.new(options)
      validator.validate_json_meaning(key, value)
    end

    it 'works for numeric values' do
      expect(validate_json_meaning(:dibels_fsf, '5')).to eq nil
      expect(validate_json_meaning(:dibels_lnf, '5')).to eq nil
      expect(validate_json_meaning(:dibels_psf, '5')).to eq nil
      expect(validate_json_meaning(:dibels_nwf_cls, '5')).to eq nil
      expect(validate_json_meaning(:dibels_nwf_wwr, '5')).to eq nil
      expect(validate_json_meaning(:dibels_dorf_wpm, '5')).to eq nil
      expect(validate_json_meaning(:dibels_dorf_errors, '5')).to eq nil
      expect(validate_json_meaning(:las_links_speaking, '5')).to eq nil
      expect(validate_json_meaning(:las_links_listening, '5')).to eq nil
      expect(validate_json_meaning(:las_links_reading, '5')).to eq nil
      expect(validate_json_meaning(:las_links_writing, '5')).to eq nil
      expect(validate_json_meaning(:las_links_overall, '5')).to eq nil

      expect(validate_json_meaning(:dibels_fsf, 'hello')).to eq 'non-integer value for benchmark_assessment_key=dibels_fsf, value=hello'
      expect(validate_json_meaning(:dibels_lnf, 'hello')).to eq 'non-integer value for benchmark_assessment_key=dibels_lnf, value=hello'
      expect(validate_json_meaning(:dibels_psf, 'hello')).to eq 'non-integer value for benchmark_assessment_key=dibels_psf, value=hello'
      expect(validate_json_meaning(:dibels_nwf_cls, 'hello')).to eq 'non-integer value for benchmark_assessment_key=dibels_nwf_cls, value=hello'
      expect(validate_json_meaning(:dibels_nwf_wwr, 'hello')).to eq 'non-integer value for benchmark_assessment_key=dibels_nwf_wwr, value=hello'
      expect(validate_json_meaning(:dibels_dorf_wpm, 'hello')).to eq 'non-integer value for benchmark_assessment_key=dibels_dorf_wpm, value=hello'
      expect(validate_json_meaning(:dibels_dorf_errors, 'hello')).to eq 'non-integer value for benchmark_assessment_key=dibels_dorf_errors, value=hello'
      expect(validate_json_meaning(:las_links_speaking, 'hello')).to eq 'non-integer value for benchmark_assessment_key=las_links_speaking, value=hello'
      expect(validate_json_meaning(:las_links_listening, 'hello')).to eq 'non-integer value for benchmark_assessment_key=las_links_listening, value=hello'
      expect(validate_json_meaning(:las_links_reading, 'hello')).to eq 'non-integer value for benchmark_assessment_key=las_links_reading, value=hello'
      expect(validate_json_meaning(:las_links_writing, 'hello')).to eq 'non-integer value for benchmark_assessment_key=las_links_writing, value=hello'
      expect(validate_json_meaning(:las_links_overall, 'hello')).to eq 'non-integer value for benchmark_assessment_key=las_links_overall, value=hello'
    end

    it 'works for integer percentages' do
      expect(validate_json_meaning(:dibels_dorf_acc, '0')).to eq nil
      expect(validate_json_meaning(:dibels_dorf_acc, '5')).to eq nil
      expect(validate_json_meaning(:dibels_dorf_acc, '100')).to eq nil

      expect(validate_json_meaning(:dibels_dorf_acc, '-1')).to eq 'required percentage_as_integer for benchmark_assessment_key=dibels_dorf_acc, but found value=-1 out of range'
      expect(validate_json_meaning(:dibels_dorf_acc, '101')).to eq 'required percentage_as_integer for benchmark_assessment_key=dibels_dorf_acc, but found value=101 out of range'
      expect(validate_json_meaning(:dibels_dorf_acc, '97%')).to eq 'required percentage_as_integer for benchmark_assessment_key=dibels_dorf_acc, but found value=97% with suffix'
      expect(validate_json_meaning(:dibels_dorf_acc, '0.97')).to eq 'required percentage_as_integer for benchmark_assessment_key=dibels_dorf_acc, but found value=0.97 that was not an integer'
    end

    it 'only enforces F&P when enforce_f_and_p_validations: true' do
      expect(validate_json_meaning(:f_and_p_english, 'A')).to eq nil
      expect(validate_json_meaning(:f_and_p_spanish, 'F')).to eq nil
      expect(validate_json_meaning(:f_and_p_english, 'A/B')).to eq nil
      expect(validate_json_meaning(:f_and_p_english, 'wat')).to eq nil

      expect(validate_json_meaning(:f_and_p_english, 'A', enforce_f_and_p_validations: true)).to eq nil
      expect(validate_json_meaning(:f_and_p_english, 'F', enforce_f_and_p_validations: true)).to eq nil
      expect(validate_json_meaning(:f_and_p_english, 'A/B', enforce_f_and_p_validations: true)).to eq 'required f_and_p_level_strict for benchmark_assessment_key=f_and_p_english, but found: A/B'
      expect(validate_json_meaning(:f_and_p_english, 'wat', enforce_f_and_p_validations: true)).to eq 'required f_and_p_level_strict for benchmark_assessment_key=f_and_p_english, but found: wat'
    end

    it 'allows text' do
      expect(validate_json_meaning(:instructional_needs, 'fluency')).to eq nil
    end
  end
end
