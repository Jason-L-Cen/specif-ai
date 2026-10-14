import { t as uiText } from "../i18n/translate";
import type { SelectOption } from '../components/core/app-select/app-select.component';

export interface TechnicalStack {
  architecture: string;
  language: string;
  framework: string;
  frontend: string;
  database: string;
}

export const TECHNICAL_STACK_FIELDS: (keyof TechnicalStack)[] = [
  'architecture', 'language', 'framework', 'frontend', 'database',
];

const LABELS: Record<string, string> = {
  bs: uiText("B/S Web 应用"), cs: uiText("C/S 桌面应用"), mobile: uiText("移动 App"), api: uiText("后端 / API 服务"),
  java: 'Java', python: 'Python', typescript: 'TypeScript', javascript: 'JavaScript',
  csharp: 'C#', go: 'Go', php: 'PHP', rust: 'Rust', cpp: 'C++',
  dart: 'Dart', kotlin: 'Kotlin', swift: 'Swift',
  spring: 'Spring Boot', quarkus: 'Quarkus', fastapi: 'FastAPI', django: 'Django', flask: 'Flask',
  nestjs: 'NestJS', express: 'Express', aspnet: 'ASP.NET Core', gin: 'Gin', echo: 'Echo',
  laravel: 'Laravel', symfony: 'Symfony', axum: 'Axum', actix: 'Actix Web',
  javafx: 'JavaFX', swing: 'Swing', pyside: 'PySide6 / Qt', tkinter: 'Tkinter',
  wpf: 'WPF（Windows）', winforms: 'Windows Forms', avalonia: 'Avalonia',
  electron: 'Electron', wails: 'Wails', tauri: 'Tauri', qt: 'Qt',
  flutter: 'Flutter', compose: 'Jetpack Compose', swiftui: 'SwiftUI', uikit: 'UIKit',
  reactnative: 'React Native', android: 'Android SDK', maui: '.NET MAUI',
  vue: 'Vue 3（TypeScript / JavaScript）', react: 'React（TypeScript / JavaScript）',
  angular: 'Angular（TypeScript）', svelte: 'Svelte（TypeScript / JavaScript）',
  html: 'HTML / CSS / JavaScript', native: uiText("框架界面（由选定框架提供）"),
  'no-frontend': uiText("无前端（API / 后台服务）"),
  postgresql: 'PostgreSQL', mysql: 'MySQL', mariadb: 'MariaDB', sqlserver: 'SQL Server',
  oracle: 'Oracle', mongodb: 'MongoDB', sqlite: 'SQLite', none: uiText("不使用数据库"),
};

const WEB_FRAMEWORKS: Record<string, string[]> = {
  java: ['spring', 'quarkus'], python: ['fastapi', 'django', 'flask'],
  typescript: ['nestjs', 'express'], javascript: ['express'], csharp: ['aspnet'], go: ['gin', 'echo'],
  php: ['laravel', 'symfony'], rust: ['axum', 'actix'],
};

const FRAMEWORKS: Record<string, Record<string, string[]>> = {
  bs: WEB_FRAMEWORKS,
  api: WEB_FRAMEWORKS,
  cs: {
    java: ['javafx', 'swing'], python: ['pyside', 'tkinter'],
    typescript: ['electron'], javascript: ['electron'], csharp: ['wpf', 'winforms', 'avalonia'],
    go: ['wails'], rust: ['tauri'], cpp: ['qt'],
  },
  mobile: {
    dart: ['flutter'], kotlin: ['compose'], swift: ['swiftui', 'uikit'],
    typescript: ['reactnative'], javascript: ['reactnative'], java: ['android'], csharp: ['maui'],
  },
};

const WEB_FRONTENDS = ['vue', 'react', 'angular', 'svelte', 'html'];
const DATABASES: Record<string, string[]> = {
  java: ['postgresql', 'mysql', 'mariadb', 'oracle', 'sqlserver', 'mongodb', 'none'],
  python: ['postgresql', 'mysql', 'mariadb', 'sqlite', 'mongodb', 'none'],
  typescript: ['postgresql', 'mysql', 'mariadb', 'mongodb', 'sqlite', 'none'],
  javascript: ['postgresql', 'mysql', 'mariadb', 'mongodb', 'sqlite', 'none'],
  csharp: ['sqlserver', 'postgresql', 'mysql', 'sqlite', 'none'],
  go: ['postgresql', 'mysql', 'sqlite', 'mongodb', 'none'],
  php: ['mysql', 'mariadb', 'postgresql', 'sqlite', 'none'],
  rust: ['postgresql', 'mysql', 'sqlite', 'none'],
};

export function getTechnicalStackOptions(field: keyof TechnicalStack, stack: TechnicalStack): SelectOption[] {
  let values: string[] = [];
  switch (field) {
    case 'architecture': values = ['bs', 'cs', 'mobile', 'api']; break;
    case 'language': values = Object.keys(FRAMEWORKS[stack.architecture] || {}); break;
    case 'framework': values = FRAMEWORKS[stack.architecture]?.[stack.language] || []; break;
    case 'frontend':
      if (!FRAMEWORKS[stack.architecture]?.[stack.language]?.includes(stack.framework)) break;
      values = stack.architecture === 'api' ? ['no-frontend']
        : stack.architecture === 'bs' || ['electron', 'wails', 'tauri'].includes(stack.framework)
          ? WEB_FRONTENDS : ['native'];
      break;
    case 'database':
      if (!FRAMEWORKS[stack.architecture]?.[stack.language]?.includes(stack.framework)) break;
      values = stack.architecture === 'mobile' ? ['sqlite', 'none']
        : stack.architecture === 'cs' ? ['sqlite', 'postgresql', 'mysql', 'sqlserver', 'none']
          : stack.framework === 'django' ? ['postgresql', 'mysql', 'mariadb', 'sqlite', 'oracle', 'none']
            : DATABASES[stack.language] || [];
      break;
  }
  return values.map(value => ({ value, label: LABELS[value] }));
}

export function describeTechnicalStack(stack: TechnicalStack): string {
  const names = [uiText("应用架构"), uiText("开发语言"), uiText("应用框架"), uiText("前端 / 界面"), stack.architecture === 'mobile' ? uiText("本地数据库") : uiText("数据库")];
  return TECHNICAL_STACK_FIELDS.map((field, index) => `${names[index]}：${LABELS[stack[field]]}`).join('\n');
}
