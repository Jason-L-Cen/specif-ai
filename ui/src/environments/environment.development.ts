import { t as uiText } from "../app/i18n/translate";
export const environment = {
  SENTRY_ENVIRONMENT: 'dev',
  SENTRY_DSN: '',
  SENTRY_RELEASE: '',
  JIRA_RATE_LIMIT_CONFIG: 9,
  ENABLE_SENTRY: false,
  DEBUG_MODE: false,
  APP_VERSION: '2.8.2-zh.11',
  ENABLE_POSTHOG: false,
  POSTHOG_KEY: '',
  POSTHOG_HOST: '',
  ThemeConfiguration: {
    appLogo: 'assets/img/logo/ace_white.svg',
    appLogoDark: 'assets/img/logo/ace.svg',
    get appName() { return uiText("爱思 产品研发助手"); },
    appEnglishName: 'Ace Product Development Assistant',
    get appWelcomeTitle() { return uiText("欢迎使用 爱思 产品研发助手"); },
    get appDescription() { return uiText("开始使用，加速软件开发生命周期（SDLC）"); },
    companyName: 'Ace',
    companyLogo: 'assets/img/logo/aceText.svg',
    companyLogoColor: 'assets/img/logo/ace.svg',
    appIcons: {
      mac: 'assets/icons/ace-pda.icns',
      win: 'assets/icons/ace-pda.ico',
      linux: 'assets/icons/ace-pda.png',
    },
  },
};
