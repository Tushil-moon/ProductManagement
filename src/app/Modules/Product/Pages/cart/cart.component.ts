import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService } from '../../../../Common/Service/Cart/cart.service';
import { AuthService } from '../../../../Services/User/auth.service';
import { filter, switchMap, tap } from 'rxjs';
import { Cart, CartData } from '../../Models/cart';
import { ToNumberPipe } from '../../../../Pipe/Product/to-number.pipe';
import { RouterLink } from '@angular/router';
import { LoaderService } from '../../../../Common/Service/loader.service';
import { ToastService } from '../../../../Common/Service/toast.service';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, ToNumberPipe, RouterLink,ScrollingModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  private cart = inject(CartService);
  private auth = inject(AuthService);
  private notify = inject(ToastService);
  loading = inject(LoaderService);

  /**
   * Hold Cart data 
   */
  cartz = signal<CartData[]>([]);

  /**
   * Hold User data
   * 
   * @defaultValue null
   */
  userdata = signal<Cart | null>(null);

  /**
   * Fetch cartdata from server
   */
  cartData = toSignal(
    this.auth.getUser().pipe(
      filter((user) => !!user),
      switchMap((user) => this.cart.getUserCart(user.email)),
      tap((res) => {
        console.log(res)
        this.userdata.set(res[0]);
        this.cartz.set(res[0].cart);
        console.log(this.cartz())
      })
    )
  );

  /**
   * Handle quantity increament, decrement and deletion
   * 
   * @param quantity product quantity
   * @param pid product id
   * @param name action name to be perform
   */
  decrementQuantity(quantity: number, pid: number, name: string): void {
    console.log(quantity);
    const existingProductIndex = this.cartz().findIndex((item: CartData) => {
      return item.productId === pid;
    });
    console.log(existingProductIndex);
    switch (name) {
      case 'Dec':
        if (quantity > 1) {
          this.cartz()[existingProductIndex].quantity -= 1;
        } else {
          this.notify.error('Quantity cannot be less than 1');
        }
        break;

      case 'Inc':
        this.cartz()[existingProductIndex].quantity += 1;
        break;

      case 'Del':
        this.cartz.set(this.cartz().filter((item) => item.productId !== pid));
        break;

      default:
        this.notify.error('Please try again later!');
        break;
    }

    const updatedCart = {
      wishlist:this.userdata()?.wishlist,
      user_email: this.userdata()?.user_email,
      user_name: this.userdata()?.user_name,
      cart: this.cartz(),
    };

    const id = this.userdata()?.id;

    if (id) {
      this.cart.updateCart(id, updatedCart).subscribe(
        (res) => {},
        (err) => {
          this.notify.error(err);
        }
      );
    }
  }

  /**
   * Handle subtotal
   * 
   * @param items all product in cart
   * @returns subtotal
   */
  calculateSubtotal(items: any[]): number {
    return items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }
}
