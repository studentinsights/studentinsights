require 'spec_helper'

RSpec.describe RestrictedTextRedacter do
  let!(:text_when_redacted) { RestrictedTextRedacter::TEXT_WHEN_REDACTED }
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  def redacted_as_json(params)
    RestrictedTextRedacter.new.redacted_as_json(**params.merge({
      super_json: params[:super_json].as_json(params[:as_json_options])
    }))
  end

  describe '#redacted_as_json' do
    context 'when is_restricted: false' do
      it 'includes :text by default' do
        expect(redacted_as_json({
          is_restricted: false,
          restricted_key: 'text',
          as_json_options: {},
          super_json: {
            wiffle: 'shmiffle',
            text: 'foo-safe'
          }
        })).to eq({
          'wiffle' => 'shmiffle',
          'text' => 'foo-safe'
        })
      end

      it 'includes :text regardless of :dangerously_include_restricted_text' do
        expect(redacted_as_json({
          is_restricted: false,
          restricted_key: 'text',
          as_json_options: {
            dangerously_include_restricted_text: false
          },
          super_json: {
            wiffle: 'shmiffle',
            text: 'foo-safe'
          }
        })).to eq({
          'wiffle' => 'shmiffle',
          'text' => 'foo-safe'
        })
      end

      it 'serializes :text when asked explicitly' do
        expect(redacted_as_json({
          is_restricted: false,
          restricted_key: 'text',
          as_json_options: {
            only: [:text]
          },
          super_json: {
            wiffle: 'shmiffle',
            text: 'foo-safe'
          }
        })).to eq({
          'text' => 'foo-safe'
        })
      end
    end
  end

  context 'when is_restricted: true' do
    it 'works normally when :text is not included' do
      expect(redacted_as_json({
        is_restricted: true,
        restricted_key: 'text',
        as_json_options: {
          only: [:wiffle]
        },
        super_json: {
          wiffle: 'shmiffle',
          text: 'bar-RESTRICTED'
        }
      })).to eq({
        'wiffle' => 'shmiffle'
      })
    end

    it 'does not serialize :text by default' do
      expect(redacted_as_json({
        is_restricted: true,
        restricted_key: 'text',
        as_json_options: {},
        super_json: {
          wiffle: 'shmiffle',
          text: 'bar-RESTRICTED'
        }
      })).to eq({
        'wiffle' => 'shmiffle',
        'text' => text_when_redacted
      })
    end

    it 'does not serialize :text even when asked explicitly' do
      expect(redacted_as_json({
        is_restricted: true,
        restricted_key: 'text',
        as_json_options: {
          only: [:text]
        },
        super_json: {
          wiffle: 'shmiffle',
          text: 'bar-RESTRICTED'
        }
      })).to eq({
        'text' => text_when_redacted
      })
    end

    it 'does not serializes :text just based on :dangerously_include_restricted_text key' do
      expect(redacted_as_json({
        is_restricted: true,
        restricted_key: 'text',
        as_json_options: {
          dangerously_include_restricted_text: false
        },
        super_json: {
          wiffle: 'shmiffle',
          text: 'bar-RESTRICTED'
        }
      })).to eq({
        'wiffle' => 'shmiffle',
        'text' => text_when_redacted
      })
    end

    it 'serializes :text only when given :dangerously_include_restricted_text: true' do
      expect(redacted_as_json({
        is_restricted: true,
        restricted_key: 'text',
        as_json_options: {
          dangerously_include_restricted_text: true
        },
        super_json: {
          wiffle: 'shmiffle',
          text: 'bar-RESTRICTED'
        }
      })).to eq({
        'wiffle' => 'shmiffle',
        'text' => 'bar-RESTRICTED'
      })
    end
  end
end
