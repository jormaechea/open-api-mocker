'use strict';

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
	title: 'OpenAPI Mocker',
	tagline: 'An API mocker based in the OpenAPI 3.0 specification',
	url: 'https://jormaechea.github.io',
	baseUrl: '/',
	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',
	favicon: 'img/favicon.ico',
	organizationName: 'jormaechea',
	projectName: 'open-api-mocker',
	themeConfig: {
		navbar: {
			title: 'OpenAPI Mocker',
			logo: {
				alt: 'OpenAPI Mocker Logo',
				src: 'img/logo.svg'
			},
			items: [
				{
					type: 'doc',
					docId: 'intro',
					position: 'left',
					label: 'Tutorial'
				},
				{
					href: 'https://github.com/jormaechea/open-api-mocker',
					label: 'GitHub',
					position: 'right'
				}
			]
		},
		footer: {
			style: 'dark',
			links: [
				{
					title: 'Docs',
					items: [
						{
							label: 'Tutorial',
							to: '/docs/intro'
						}
					]
				},
				{
					title: 'Community',
					items: [
						{
							label: 'Issues',
							href: 'https://github.com/jormaechea/open-api-mocker/issues'
						}
					]
				},
				{
					title: 'More',
					items: [
						{
							label: 'GitHub',
							href: 'https://github.com/jormaechea/open-api-mocker'
						},
						{
							label: 'NPM',
							to: 'https://www.npmjs.com/package/open-api-mocker'
						},
						{
							label: 'Docker',
							to: 'https://hub.docker.com/repository/docker/jormaechea/open-api-mocker'
						}
					]
				}
			],
			copyright: 'OpenAPI Mocker - Built with 💚 by <a href="https://github.com/jormaechea">jormaechea</a> and other awesome contributors'
		}
	},
	presets: [
		[
			'@docusaurus/preset-classic',
			{
				docs: {
					sidebarPath: require.resolve('./sidebars.js'),
					// Please change this to your repo.
					editUrl:
						'https://github.com/jormaechea/open-api-mocker/edit/master/docs/'
				},
				blog: {
					showReadingTime: true,
					// Please change this to your repo.
					editUrl:
						'https://github.com/jormaechea/open-api-mocker/edit/master/docs/blog/'
				},
				theme: {
					customCss: require.resolve('./src/css/custom.css')
				}
			}
		]
	]
};
