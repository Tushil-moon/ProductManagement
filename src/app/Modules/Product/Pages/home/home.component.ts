import { Component, inject, signal } from '@angular/core';
import { ProductService } from '../../../../Services/Product/product.service';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  catchError,
  concatMap,
  filter,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { PaginatedResponse, Products } from '../../Models/productResponse';
import { HeaderComponent } from '../../Components/header/header.component';
import { RouterLink } from '@angular/router';
import {
  CarouselComponent,
  CarouselControlComponent,
  CarouselInnerComponent,
  CarouselItemComponent,
  ThemeDirective,
} from '@coreui/angular';
import { LoaderService } from '../../../../Common/Service/loader.service';
import { CartService } from '../../../../Common/Service/Cart/cart.service';
import { AuthService } from '../../../../Services/User/auth.service';
import { CryptoService } from '../../../../Services/crypto.service';
import { ToastService } from '../../../../Common/Service/toast.service';
import { Cart, Wishlist } from '../../Models/cart';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    RouterLink,
    CarouselComponent,
    CarouselControlComponent,
    CarouselInnerComponent,
    CarouselItemComponent,
    ThemeDirective,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private product = inject(ProductService);
  private cart = inject(CartService);
  private auth = inject(AuthService);
  private crypto = inject(CryptoService);
  private notify = inject(ToastService);
  loading = inject(LoaderService);

  /**
   * for wishlist
   */
  favoriteStatus = signal<{ [key: number]: boolean }>({});

  /**
   * This behaviour subject hold the product list data
   */
  _productList$ = new BehaviorSubject<Products[]>([]);

  /**
   * Take behaviour subject as observable to store data
   */
  private productList$ = this._productList$.asObservable();

  /**
   * setter method for product list observable
   *
   * @param product - prodcut data
   */
  set productList(product: Products[]) {
    this._productList$.next(product);
  }

  getUser = toSignal(
    this.auth.getUser().pipe(
      filter((user) => !!user),
      switchMap((user) => this.cart.getUserCart(user.email)),
      tap((res) => {
        if (res && res[0].wishlist) {
          // Safely check if wishlist exists and is an array
          res[0].wishlist.forEach((element: Wishlist) => {
            this.favoriteStatus()[element.id] = element.favorite; // Mark as favorite
          });
          console.log(this.favoriteStatus());
        }
        // console.log(this.favoriteStatus())
      })
    )
  );

  /**
   * Combine all api data in one list using concatmap and recursive function
   */
  getAllProduct = toSignal(
    this.product.getAllProducts().pipe(
      tap(() => {this.loading.show()
        console.log('vcalac')
      }),
      concatMap((res: PaginatedResponse) => {
        this.productList = res.data;
        return this.recursiveProductFetch(res.next_page_url);
      }),
      tap((res) => {
        
        const data = res?.data
        if (data) {
          this.productList = data;
          console.log(this._productList$.value);
        }
        this.loading.hide();
      }),
      catchError((error) => {
        console.error('An error occurred while fetching products:', error);
        this.loading.hide();
        this.notify.error('Failed to load products. Please try again later.');
        return of(null);
      })
    )
  );

  /**
   * Recursive function to fetch paginated products until `next_page_url` is null.
   *
   * @param nextPageUrl - api url from responce
   * @returns combine product data
   */
  recursiveProductFetch(
    nextPageUrl: string | null
  ): Observable<PaginatedResponse | null> {
    return nextPageUrl
      ? this.product.nextPageProduct(nextPageUrl).pipe(
        tap(() => this.loading.show()),
          concatMap((res: PaginatedResponse | null) => {
            if (res) {
              this.productList = [...this._productList$.value, ...res.data];
              const data = this._productList$.value.slice(-8).reverse();
              if (data) {
                this.productList = data;
                console.log(this._productList$.value);
              }
              return this.recursiveProductFetch(res.next_page_url);
            } else {
              return of(null);
            }
          })
        )
      : of(null);
  }

  /**
   * method use to store status product wishlist
   *
   * @param event button event
   * @param productId - product id
   */
  toggleFavorite(event: Event, product: Products): void {
    event.stopPropagation();
    this.addToCart(product, 'Wish');
  }

  /**
   * method use for iterate wishlist status
   *
   * @param productId - product id
   * @returns truthy value
   */
  isFavorited(productId: number): boolean {
    return !!this.favoriteStatus()[productId];
  }

  /**
   *
   * @param product
   * @param action
   */
  addToCart(product: Products, action: string): void {
    const user = this.auth.getDatafromLocal('User');
    console.log(product);

    if (user) {
      const userdata = JSON.parse(this.crypto.decrypt(user));
      const userEmail = userdata.email;

      this.cart.getUserCart(userEmail).subscribe((res: any) => {
        const userCart = res[0].cart || [];
        let userWishlist = res[0].wishlist || [];
        console.log('==============', userWishlist);
        if (action === 'Cart') {
          const existingProductIndex = userCart.findIndex(
            (item: any) => item.productId === product.id
          );
          if (existingProductIndex > -1) {
            userCart[existingProductIndex].quantity += 1;
          } else {
            userCart.push({
              product_image: product.image,
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
            });
          }
        } else {
          const existingWishlistProduct = userWishlist.findIndex(
            (item: Products) => {
              return item.id === product.id;
            }
          );
          console.log(existingWishlistProduct);
          if (existingWishlistProduct !== -1) {
            this.favoriteStatus()[product.id] = false;
            userWishlist= userWishlist.filter((item: Products) => item.id !== product.id);
            this.notify.success('Item removed from wishlist!');
          } else {
            this.favoriteStatus()[product.id] = true;
            userWishlist.push({
              ...product,
              favorite: this.favoriteStatus()[product.id],
            });
            this.notify.success('Item added to wishlist!');
          }
        }
        const updatedCart = {
          user_email: userEmail,
          user_name: userdata.user_name,
          cart: userCart,
          wishlist: userWishlist,
        };
        const cartAction =
          res?.length > 0
            ? this.cart.updateCart(res[0].id, updatedCart)
            : this.cart.addToCart(updatedCart);

        cartAction.subscribe(
          () => {},
          (err) => this.notify.error(err)
        );
      });
    } else {
      this.notify.error('No user found');
    }
  }
}
