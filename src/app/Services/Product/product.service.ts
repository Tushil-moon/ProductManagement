import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { Product } from '../../Modules/Product/Models/product';
import {
  PaginatedResponse,
  Products,
} from '../../Modules/Product/Models/productResponse';
import { ToastService } from '../../Common/Service/toast.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private notify = inject(ToastService);

  /**
   * actual apiurl use for communication between client-server
   */
  private readonly apiUrl =
    'http://192.168.0.174:8000/laravel-sanctum-api/public/api/products';

  /**
   * This method use to fetch all product from server
   *
   * @returns Response of products data
   */
  getAllProducts(): Observable<PaginatedResponse> {
    return this.http
      .get<PaginatedResponse>(`${this.apiUrl}/list`)
      .pipe(catchError(this.handleError));
  }

  /**
   * This method use to get product by id
   *
   * @param id product id
   * @returns product
   */
  getProductById(id: number): Observable<Products> {
    return this.http.post<Products>(`${this.apiUrl}/list?id=${id}`, null);
  }

  /**
   *  This method use for get page vise product
   *
   * @param url api url
   * @returns product data
   */
  nextPageProduct(url: string | null): Observable<PaginatedResponse | null> {
    if (typeof url === 'string') {
      return this.http.get<PaginatedResponse>(url);
    } else {
      return of(null);
    }
  }

  /**
   * This method use to add new product in database
   *
   * @param productData - Detail of product to be add
   * @returns - Response of product added
   */
  handleAddProduct(productData: FormData): Observable<Product> {
    const body = productData;
    return this.http.post<Product>(this.apiUrl, body);
  }

  /**
   * This method use to handle update of products data
   *
   * @param productId - Id of product to be update
   * @param productData - Detail of product to be update
   * @returns - Response of product updated
   */
  handleUpdateProduct(
    productId: number,
    productData: FormData
  ): Observable<Product> {
    const body = productData;
    return this.http.post<Product>(
      `${this.apiUrl}/update?id=${productId}`,
      body
    );
  }

  /**
   * This method use to handle deletion of products data
   *
   * @param productId - Id of product to be delete
   * @returns - Response of success or empty
   */
  handleDeleteProduct(productId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/delete?id=${productId}`, null);
  }

  /**
   * Handles HTTP errors by formatting them into user-friendly messages.
   *
   * @param error The HTTP error response.
   * @returns An observable that emits an error message.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      errorMessage = `Error ${error.status}: ${error.message}`;
    }
    // Log the error to the console (you might want to send it to a logging server instead)
    this.notify.error(errorMessage);

    // Return an observable with a user-facing error message
    return throwError(() => new Error(errorMessage));
  }
}
