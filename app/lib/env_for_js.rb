class EnvForJs
  def as_json
    {
      railsEnvironment: Rails.env,
      districtKey: EnvironmentVariable.value('DISTRICT_KEY'),
      deploymentKey: EnvironmentVariable.value('DEPLOYMENT_KEY'),
      shouldReportAnalytics: EnvironmentVariable.is_true('SHOULD_REPORT_ANALYTICS'),
      shouldReportErrors: EnvironmentVariable.is_true('SHOULD_REPORT_ERRORS'),
      isDemoSite: EnvironmentVariable.is_true('DEMO_SITE'),
      sessionTimeoutInSeconds: Devise.timeout_in.to_i,
      mixpanelToken: EnvironmentVariable.value('MIXPANEL_TOKEN'),
      rollbarJsAccessToken: EnvironmentVariable.value('ROLLBAR_JS_ACCESS_TOKEN'),
    }
  end
end
