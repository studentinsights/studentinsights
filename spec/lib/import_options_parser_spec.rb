require 'spec_helper'

RSpec.describe ImportOptionsParser do
  it 'raises when called outside a rake task' do
    expect { ImportOptionsParser.new([]).parsed_options }.to raise_error(RuntimeError, 'Expected to be called from a rake task')
  end

  it 'raises when called with arguments but not explicit -- separator' do
    expect { ImportOptionsParser.new(['import:run', '--background']).parsed_options }.to raise_error(RuntimeError, 'When calling from a rake task, use -- after the script name to pass arguments')
  end

  it 'raises when parsing unexpected command line argument' do
    command = 'import:run -- --unexpected-arg'
    argv = command.split(' ')
    expect { ImportOptionsParser.new(argv).parsed_options }.to raise_error(OptionParser::InvalidOption, 'invalid option: --unexpected-arg')
  end

  it 'works when called with no arguments' do
    expect(ImportOptionsParser.new(['import:run']).parsed_options).to eq({
      :background => true,
      :only_recent_attendance => false,
      :importer_keys => [
        "EducatorsImporter",
        "CoursesSectionsImporter",
        "EducatorSectionAssignmentsImporter",
        "StudentsImporter",
        "StudentSectionAssignmentsImporter",
        "BehaviorImporter",
        "AttendanceImporter",
        "StudentSectionGradesImporter",
        "X2AssessmentImporter",
        "StarMathImporter",
        "StarReadingImporter"
      ],
      :school_local_ids => [
        "BRN",
        "HEA",
        "KDY",
        "AFAS",
        "ESCS",
        "WSNS",
        "WHCS",
        "NW",
        "SHS",
        "FC",
        "CAP",
        "PIC",
        "SPED"
      ]
    })
  end

  it 'works when called with arguments' do
    command = 'import:run -- --background --only-recent-attendance --school-local-ids=hea,brn,kdy --importer-keys=AttendanceImporter'
    argv = command.split(' ')
    expect(ImportOptionsParser.new(argv).parsed_options).to eq({
      :background => true,
      :only_recent_attendance => true,
      :importer_keys => ["AttendanceImporter"],
      :school_local_ids => ["hea", "brn", "kdy"]
    })
  end

  it 'does not validate content of arguments' do
    command = 'import:run -- --importer-keys=whatever'
    argv = command.split(' ')
    expect(ImportOptionsParser.new(argv).parsed_options[:importer_keys]).to eq(['whatever'])
  end
end
