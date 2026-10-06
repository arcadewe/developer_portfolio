import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./features/home/home.page').then((module) => module.HomePage),
	},
	{
		path: 'about-me',
		loadComponent: () => import('./features/about-me/about-me.page').then((module) => module.AboutMePage),
	},
	{
		path: 'experience',
		loadComponent: () => import('./features/experience/experience.page').then((module) => module.ExperiencePage),
	},
	{
		path: 'courses',
		loadComponent: () => import('./features/courses/courses.page').then((module) => module.CoursesPage),
	},
	{ path: '**', redirectTo: '' },
];
