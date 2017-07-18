require 'rails_helper'

RSpec.describe IepDocumentsController, type: :controller do

  describe '#show' do

    context 'educator has permissions for associated student' do
      it 'renders a pdf' do

      end
    end

    context 'educator does not have permissions for associated student' do
      it 'does not render' do

      end
    end

  end

end
