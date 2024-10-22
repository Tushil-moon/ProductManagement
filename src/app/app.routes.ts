import { Routes } from '@angular/router';
import { RegisterComponent } from './Modules/User/Pages/register/register.component';
import { LoginComponent } from './Modules/User/Pages/login/login.component';
import { HomeComponent } from './Modules/Product/Pages/home/home.component';
import { authGuard } from './Guards/Auth/auth.guard';
import { protectedGuard } from './Guards/Auth/protected.guard';
import { AddproductComponent } from './Modules/Product/Pages/add-update-product/addproduct.component';
import { ProductListComponent } from './Modules/Product/Pages/product-list/product-list.component';
import { ProductDetailComponent } from './Modules/Product/Pages/product-detail/product-detail.component';
import { ProfileComponent } from './Modules/User/Pages/profile/profile.component';
import { CartComponent } from './Modules/Product/Pages/cart/cart.component';
import { WishComponent } from './Modules/Product/Pages/wish/wish.component';
import { InfiniteComponent } from './Modules/infinite/infinite.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'add-product', component: AddproductComponent ,canActivate:[authGuard]},
  { path: 'profile', component: ProfileComponent ,canActivate:[authGuard]},
  { path: 'update/:id', component: AddproductComponent ,canActivate:[authGuard]},
  { path: 'product/:id', component: ProductDetailComponent,canActivate:[authGuard] },
  { path: 'product-list', component: ProductListComponent,canActivate:[authGuard] },
  { path: 'cart', component: CartComponent, canActivate:[authGuard] },
  { path: 'wishlist', component: WishComponent, canActivate:[authGuard] },
  { path: 'login', component: LoginComponent ,canActivate:[protectedGuard]},
  { path: 'home', component: HomeComponent,canActivate:[protectedGuard] },
  { path: 'infinite', component: InfiniteComponent},
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login', pathMatch: 'full' },
];