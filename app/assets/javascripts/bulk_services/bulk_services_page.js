(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  var BulkServiceUploadDetail = window.shared.BulkServiceUploadDetail;

  var BulkServicesPage = window.shared.BulkServicesPage = React.createClass({

    propTypes: {
      serializedData: React.PropTypes.object.isRequired,
    },

    render: function() {
      return dom.div({},
        dom.div({
          style: {
            width: '50%'
          }
        }, this.renderPastBulkServices())
      );
    },

    renderPastBulkServices: function () {
      var serviceUploads = this.props.serializedData.serviceUploads;

      return serviceUploads.map(function (serviceUpload) {
        return createEl(BulkServiceUploadDetail, {
          data: serviceUpload
        });
      }, this);
    },

  });

})();
