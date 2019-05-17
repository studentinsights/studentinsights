require 'rails_helper'
RSpec.describe MtssReferralProcessor do
  let!(:pals) { TestPals.create! }

  describe 'integration test' do
    it 'works' do
      sheetsFetcher = GoogleSheetsImporter.new
      file_text = sheetsFetcher.getSheetsFromFolder("Student Insights Sync Test")
      importer = MtssReferralProcessor.new
      rows = importer.process(file_text)
      expect(rows).to contain_exactly(*[{
        :student_id=>pals.healey_kindergarten_student.id,
        :educator_id=>pals.healey_sarah_teacher.id,
        :event_note_type_id=>304,
        :is_restricted=>false,
        :recorded_at=>Date.parse('Thu, 17 Jan 2019 08:22:18 +0000'),
        :text=>"MTSS Referral Form\n\nWhat do you like to do? What are your interests?\nbooks\n\nWhat motivates you to do your best work?\ndrive\n\nWhat do you want to be in the future?\nbe a doctor\n\nWhat classes are you doing well in?\nSocial Studies\n\nWhy are you doing well in those classes?\nthe world is cool\n\nWhat classes are you struggling with?\nScience\n\nWhen you are struggling, who do you go to for support?\nmy sister\n\nWhat is hardest about those classes?\nListening and taking notes, Doing the homework\n\nIf student answers \"paying attention in class/not getting distracted\", what is distracting or preventing you from paying attention?\nother kids\n\nIf student answers \"understanding/making sense of the content\", what is difficult to understand or what doesn't make sense?\nthe world is confusing!\n\nWhy do you think that is hardest for you?\nunderstanding how things work\n\nHow do you think your teachers can help you so your grades improve?\nlet me learn in different ways\n\nAt the end of the quarter, what would make you most proud of your accomplishments in your classes?\nif i wrote an article in the somerville paper\n\nWhat else do you want your teachers to know so that they can help you do better?\ni want to be a journalist\n\nReferral Classification\nAcademic\n\nWhat is the main reason for this referral?\nreading comprehension\n\nReading/ELA Concern: Check all areas that apply.\nliteral comprehension\n\nExplain reading/ELA concern.\ntoo literal, struggles with inferences\n\nWriting Concern: Check all areas that apply.\nwritten organization, essay writing\n\nExplain writing concern.\ndisorganized\n\nWhat have you already tried with this student that has been successful?\ntrying to modify writing assignments to allow oral brainstorming first\n\nWhat have you already tried with this student that has NOT been successful?\nchecklists, deadline, check-ins on progress"
      }])
    end
  end
end
