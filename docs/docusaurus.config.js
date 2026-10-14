// @ts-check
const config = {
  title: '爱思 产品研发助手',
  tagline: 'Ace Product Development Assistant · Ace PDA',
  customFields: {
    subTagline:
      'Transform requirements into intelligent solutions with enterprise-grade AI.',
  },
  url: 'https://specifai.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  organizationName: 'hai',
    projectName: 'specifai',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 8,
        searchResultContextMaxLength: 50,
        searchBarShortcut: true,
        fuzzyMatchingDistance: 1,
      },
    ],
  ],

  markdown: {
    mermaid: true,
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/Jason-L-Cen/specif-ai/tree/dev-JasonCen/docs/',
          routeBasePath: '/',
          sidebarCollapsible: true,
          sidebarCollapsed: false,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/styles/global.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/ace-pda.png',
      navbar: {
        title: 'Ace PDA',
        logo: {
          alt: 'Ace PDA Logo',
          src: 'img/ace.svg',
          srcDark: 'img/ace_white.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://github.com/Jason-L-Cen/specif-ai',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {
                label: 'Getting Started',
                to: '/current/getting-started',
              },
              {
                label: 'Core Features',
                to: '/current/core-features',
              },
              {
                label: 'Advanced Features',
                to: '/current/advanced-features',
              },
              {
                label: 'Troubleshooting',
                to: '/current/troubleshooting',
              },
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'ADO Integration',
                to: '/current/ADO-README',
              },
              {
                label: 'JIRA Integration',
                to: '/current/JIRA-README',
              },
              {
                label: 'Setup Guide',
                to: '/current/integrations-setup',
              },
            ],
          },
          {
            title: 'Ace PDA',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/Jason-L-Cen/specif-ai',
              },
              {
                label: 'Issues',
                href: 'https://github.com/Jason-L-Cen/specif-ai/issues',
              },
              {
                label: 'License',
                href: 'https://github.com/Jason-L-Cen/specif-ai/blob/dev-JasonCen/LICENSE',
              },
            ],
          },
        ],
        copyright: 'Ace PDA · 原始开源版权信息见 MIT LICENSE',
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
      },
    }),
};

module.exports = config;
