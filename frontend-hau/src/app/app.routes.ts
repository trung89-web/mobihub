import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'store' },
	{
		path: 'store',
		loadComponent: () => import('./pages/store-page.component').then((page) => page.StorePageComponent)
	},
	{
		path: 'products/:id',
		loadComponent: () => import('./pages/product-detail-page.component').then((page) => page.ProductDetailPageComponent)
	},
	{
		path: 'login',
		loadComponent: () => import('./pages/login-page.component').then((page) => page.LoginPageComponent)
	},
	{
		path: 'cart',
		loadComponent: () => import('./pages/cart-page.component').then((page) => page.CartPageComponent)
	},
	{
		path: 'account',
		loadComponent: () => import('./components/account-layout.component').then((layout) => layout.AccountLayoutComponent),
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'profile' },
			{ path: 'profile', loadComponent: () => import('./pages/account-profile-page.component').then((page) => page.AccountProfilePageComponent) },
			{ path: 'addresses', loadComponent: () => import('./pages/account-addresses-page.component').then((page) => page.AccountAddressesPageComponent) },
			{ path: 'payment', loadComponent: () => import('./pages/account-payment-page.component').then((page) => page.AccountPaymentPageComponent) },
			{ path: 'orders', loadComponent: () => import('./pages/orders-page.component').then((page) => page.OrdersPageComponent) },
			{ path: 'warranties', loadComponent: () => import('./pages/warranties-page.component').then((page) => page.WarrantiesPageComponent) }
		]
	},
	{ path: 'orders', pathMatch: 'full', redirectTo: 'account/orders' },
	{ path: 'warranties', pathMatch: 'full', redirectTo: 'account/warranties' },
	{ path: '**', redirectTo: 'store' }
];
