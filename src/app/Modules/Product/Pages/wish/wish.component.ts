import { Component, inject, signal } from '@angular/core';
import { Wishlist } from '../../Models/cart';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService } from '../../../../Common/Service/Cart/cart.service';
import { AuthService } from '../../../../Services/User/auth.service';
import { filter, switchMap, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-wish',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './wish.component.html',
  styleUrl: './wish.component.css',
})
export class WishComponent {
 
  private cart = inject(CartService);
  private auth = inject(AuthService);

  wishlist = signal<Wishlist[]>([]);

  getWishlist = toSignal(
    this.auth.getUser().pipe(
      filter((user) => !!user),
      switchMap((user) => this.cart.getUserCart(user.email)),
      tap((res) => {
        if (res && res[0].wishlist) {
          // res[0].wishlist.forEach((element: Wishlist) => {
          //   this.favoriteStatus()[element.id] = element.favorite; // Mark as favorite
          // });
          // console.log(this.favoriteStatus());
          this.wishlist.set(res[0].wishlist)
        }
        // console.log(this.favoriteStatus())
      })
    )
  );

  toggleFavorite(arg0: any) {
    throw new Error('Method not implemented.');
  }

  isFavorited(arg0: any):number {
    throw new Error('Method not implemented.');
  }

  addToCart(arg0: any) {
    throw new Error('Method not implemented.');
  }
}
