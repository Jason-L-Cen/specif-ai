import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { initializeUILanguage } from './app/i18n/translate';
import * as Sentry from '@sentry/angular';
import { environment } from './environments/environment';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';

registerLocaleData(zh);

if (environment.ENABLE_SENTRY) {
  Sentry.init({
    dsn: environment.SENTRY_DSN,
    environment: environment.SENTRY_ENVIRONMENT,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.breadcrumbsIntegration({
        console: true,
        dom: true,
        fetch: true,
        history: true,
        xhr: true,
      }),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    release: environment.SENTRY_RELEASE,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    tracesSampleRate: 1.0,
  });
} else {
  console.log('Disabling sentry based on the environment configuration.');
}

initializeUILanguage()
  .then(() => import('./app/app.module'))
  .then(({ AppModule }) => platformBrowserDynamic().bootstrapModule(AppModule))
  .catch((err) => console.error(err));
