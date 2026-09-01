// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	// Set to the production URL on Vercel so the sitemap is generated.
	// site: 'https://your-domain.vercel.app',
	integrations: [
		starlight({
			title: 'دليل استخدام نظام ION',
			description: 'الدليل الكامل لجميع تخصيصات ION على منصة Frappe / ERPNext / HRMS — المشتريات، المبيعات وإدارة العملاء، الموارد البشرية، التوظيف، التحويل بين الشركات، وتكامل البصمة.',
			// Arabic is the only locale: no /ar/ prefix, RTL layout everywhere.
			locales: {
				root: { label: 'العربية', lang: 'ar', dir: 'rtl' },
			},
			customCss: ['./src/styles/manual.css'],
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
			pagination: true,
			lastUpdated: true,
			sidebar: [
				{ label: 'ابدأ من هنا', items: [{ autogenerate: { directory: 'start' } }] },
				{ label: 'المشتريات (ION)', items: [{ autogenerate: { directory: 'buying' } }] },
				{ label: 'المبيعات وإدارة العملاء', items: [{ autogenerate: { directory: 'sales-crm' } }] },
				{ label: 'تخصيصات الموارد البشرية', items: [{ autogenerate: { directory: 'hr' } }] },
				{ label: 'التوظيف', items: [{ autogenerate: { directory: 'career' } }] },
				{ label: 'التحويل بين الشركات', items: [{ autogenerate: { directory: 'intercompany' } }] },
				{ label: 'تكامل البصمة BioTime', items: [{ autogenerate: { directory: 'biotime' } }] },
				{ label: 'المستخدمون والأدوار', items: [{ autogenerate: { directory: 'users' } }] },
				{ label: 'المساعدة', items: [{ autogenerate: { directory: 'help' } }] },
			],
		}),
	],
});
