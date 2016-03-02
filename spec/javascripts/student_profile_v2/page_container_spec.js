//= require ./fixtures

describe('PageContainer', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var SpecSugar = window.shared.SpecSugar;
  var PageContainer = window.shared.PageContainer;    
  var Fixtures = window.shared.Fixtures;

  var helpers = {
    findColumns: function(el) {
      return $(el).find('.summary-container > div');
    },

    interventionSummaryLists: function(el) {
      return $(el).find('.interventions-column .SummaryList').toArray();
    },
    
    createSpyActions: function() {
      return {
        onColumnClicked: jasmine.createSpy('onColumnClicked'),
        onClickSaveNotes: jasmine.createSpy('onClickSaveNotes'),
        onClickSaveService: jasmine.createSpy('onClickSaveService')
      };
    },
    
    renderInto: function(el, props) {
      var mergedProps = merge(props || {}, {
        nowMomentFn: function() { return Fixtures.nowMoment; },
        serializedData: Fixtures.studentProfile,
        queryParams: {}
      });
      return ReactDOM.render(createEl(PageContainer, mergedProps), el);
    },

    takeNotesAndSave: function(el, uiParams) {
      $(el).find('.btn.take-notes').click();
      SpecSugar.changeTextValue($(el).find('textarea'), uiParams.text);
      $(el).find('.btn.note-type:contains(' + uiParams.eventNoteTypeText + ')').click();
      $(el).find('.btn.save').click();
    },

    recordServiceAndSave: function(el, uiParams) {
      $(el).find('.btn.record-service').click();
      $(el).find('.btn.service-type:contains(' + uiParams.serviceText + ')').click();
      SpecSugar.changeReactSelect($(el).find('.Select'), uiParams.educatorText);
      SpecSugar.changeTextValue($(el).find('.datepicker'), uiParams.dateStartedText);
      $(el).find('.btn.save').click();
    }
  };

  SpecSugar.withTestEl('integration tests', function() {
    it('renders everything on the happy path', function() {
      var el = this.testEl;
      helpers.renderInto(el);

      expect(el).toContainText('Daisy Poppins');
      expect(helpers.findColumns(el).length).toEqual(5);
      expect($(el).find('.Sparkline').length).toEqual(9);
      expect($(el).find('.InterventionsDetails').length).toEqual(1);

      var interventionLists = helpers.interventionSummaryLists(el);
      expect(interventionLists.length).toEqual(3);
      expect(interventionLists[0]).toContainText('Reg Ed');
      expect(interventionLists[0]).toContainText('Homeroom 102');
      expect(interventionLists[1]).toContainText('Counseling, outside');
      expect(interventionLists[1]).toContainText('Attendance Contract');
      expect(interventionLists[2]).toContainText('demo@');
    });

    it('opens dialog when clicking Take Notes button', function() {
      var el = this.testEl;
      helpers.renderInto(el);

      $(el).find('.btn.take-notes').click();
      expect(el).toContainText('What are these notes from?');
      expect(el).toContainText('Save notes');
    });

    it('opens dialog when clicking Record Service button', function() {
      var el = this.testEl;
      helpers.renderInto(el);

      $(el).find('.btn.record-service').click();
      expect(el).toContainText('Who is working with Daisy?');
      expect(el).toContainText('Record service');
    });

    it('can save notes for SST meetings, mocking the action handlers', function() {
      var el = this.testEl;
      var component = helpers.renderInto(el, { actions: helpers.createSpyActions() });
      helpers.takeNotesAndSave(el, {
        eventNoteTypeText: 'SST meeting',
        text: 'hello!'
      });

      expect(component.props.actions.onClickSaveNotes).toHaveBeenCalledWith({
        eventNoteTypeId: 1,
        text: 'hello!'
      });
    });

    it('can save an Attendance Contract service, mocking the action handlers', function() {
      var el = this.testEl;
      var component = helpers.renderInto(el, { actions: helpers.createSpyActions() });
      helpers.recordServiceAndSave(el, {
        serviceText: 'Attendance Contract',
        educatorText: 'fake-fifth-grade',
        dateStartedText: '2/22/16'
      });

      expect(component.props.actions.onClickSaveService).toHaveBeenCalledWith({
        serviceTypeId: 503,
        providedByEducatorId: 2,
        dateStartedText: '2016-02-22',
        recordedByEducatorId: 1
      });
    });
  });
});