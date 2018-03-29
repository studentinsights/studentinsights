class IepFileNameParser < Struct.new :path

  def local_id
    pdf_basename.split('_')[0]
  end

  def file_name
    path.split("/").last
  end

  def check_iep_at_a_glance
    raise 'oh no!' if pdf_basename.split('_')[1] != 'IEPAtAGlance'
  end

  private

    def pdf_basename
      Pathname.new(path).basename.sub_ext('').to_s
    end

end
