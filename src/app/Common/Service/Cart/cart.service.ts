import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cart, CartData } from '../../../Modules/Product/Models/cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);

  /**
   * Actual api url for hit all actions
   */
  private readonly apiUrl = 'http://localhost:3000';

  /**
   * fetch user cart
   *
   * @param email user email
   * @returns user cart data
   */
  getUserCart(email: string): Observable<Cart[]> {
    return this.http.get<Cart[]>(`${this.apiUrl}/users?user_email=${email}`);
  }

  /**
   * Add a product to the user's cart
   *
   * @param cart cart data
   * @returns added cart data
   */
  addToCart(cart: any): Observable<CartData> {
    // First, get the user's cart
    return this.http.post<CartData>(`${this.apiUrl}/users`, cart);
  }

  /**
   * Update quantity or remove product
   *
   * @param userId user id
   * @param cart cart to be update
   * @returns updated cart data
   */
  updateCart(userId: string | null, cart: any): Observable<CartData> {
    return this.http.put<CartData>(`${this.apiUrl}/users/${userId}`, cart);
  }
}
