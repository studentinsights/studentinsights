// //= require ./fixtures

// describe('NotesList', function() {
//   var dom = window.shared.ReactHelpers.dom;
//   var createEl = window.shared.ReactHelpers.createEl;
//   var merge = window.shared.ReactHelpers.merge;

//   var SpecSugar = window.shared.SpecSugar;
//   var NotesList = window.shared.NotesList;    
//   var Fixtures = window.shared.Fixtures;

//   var helpers = {
//     findColumns: function(el) {
//       return $(el).find('.summary-container > div');
//     },
    
//     createSpyActions: function() {
//       return {
//         onColumnClicked: jasmine.createSpy('onColumnClicked'),
//         onClickSaveNotes: jasmine.createSpy('onClickSaveNotes')
//       };
//     },
    
//     renderInto: function(el, props) {
//       var mergedProps = merge(props || {}, {
//         nowMomentFn: function() { return Fixtures.nowMoment; },
//         serializedData: Fixtures.studentProfile,
//         queryParams: {}
//       });
//       return ReactDOM.render(createEl(NotesList, mergedProps), el);
//     },

//     takeNotesAndSave: function(el, typeName, text) {
//       $(el).find('.btn.take-notes').click();
//       SpecSugar.changeTextValue($(el).find('textarea'), 'hello!');
//       $(el).find('.btn.note-type:contains(SST meeting)').click();
//       $(el).find('.btn.save').click();
//     }
//   };

//   SpecSugar.withTestEl('high-level integration tests', function() {
//     it('renders everything on the happy path', function() {
//       var el = this.testEl;
//       helpers.renderInto(el);

//       expect(el).toContainText('Daisy Poppins');
//       expect(helpers.findColumns(el).length).toEqual(5);
//       expect($('.Sparkline').length).toEqual(9);
//       expect($('.InterventionsDetails').length).toEqual(1);
//     });

//     it('opens dialog when clicking Take Notes button', function() {
//       var el = this.testEl;
//       helpers.renderInto(el);

//       $(el).find('.btn.take-notes').click();
//       expect(el).toContainText('What are these notes from?');
//       expect(el).toContainText('Save notes');
//     });

//     it('opens dialog when clicking Record Service Delivery button', function() {
//       var el = this.testEl;
//       helpers.renderInto(el);

//       $(el).find('.btn.record-service').click();
//       expect(el).toContainText('Who is working with Daisy?');
//       expect(el).toContainText('Record service');
//     });

//     it('saving notes for SST meetings works, mocking the action handlers', function() {
//       var el = this.testEl;
//       var component = helpers.renderInto(el, { actions: helpers.createSpyActions() });
//       helpers.takeNotesAndSave(el, 'SST meeting', 'hello!');

//       expect(component.props.actions.onClickSaveNotes).toHaveBeenCalledWith({
//         eventNoteTypeId: 1,
//         text: 'hello!'
//       });
//     });
//   });
// });