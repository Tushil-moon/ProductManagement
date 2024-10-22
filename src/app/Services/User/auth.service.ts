import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, debounceTime, delay, Observable, of, retry, retryWhen, take, tap, throwError } from 'rxjs';
import { RegisterUser } from '../../Modules/User/Models/registeruser';
import { LoginUser } from '../../Modules/User/Models/loginuser';
import { ApiResponse, User } from '../../Modules/User/Models/apires';
import { CryptoService } from '../crypto.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private crypto = inject(CryptoService);

  private readonly apiUrl =
    'http://192.168.0.174:8000/laravel-sanctum-api/public/api';

  /**
   * This method use to register user on server
   *
   * @param data - Details of user to be register
   * @returns - Response of registered user
   */
  registerUser(data: FormData): Observable<RegisterUser> {
    const body = data;
    return this.http.post<RegisterUser>(`${this.apiUrl}/register`, body);
  }

  /**
   * This method use to handle user login
   *
   * @param data - Details of credential of user to be login
   * @returns - Response of Login user
   */
  loginUser(data: LoginUser): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/login`, data).pipe(
      retryWhen(errors =>
        errors.pipe(
          tap(() => console.log('Retrying...')), // Optional: Log each retry attempt
          delay(1000), // Wait 1 second between retries
          take(3) // Limit to 3 retry attempts
        )
      ),
      catchError(err => {
        console.error('Login failed:', err); // Handle errors here if necessary
        return throwError(err); // Rethrow error to handle it in the subscriber
      })
    );
  }

  /**
   * method use for update user detail on database
   *
   * @param userid user ID
   * @param formData user details
   * @returns updated user details
   */
  updateUser(userid: number, formData: FormData): Observable<ApiResponse> {
    const token = localStorage.getItem('Token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.post<any>(
      `${this.apiUrl}/user/update?id=${userid}`,
      formData,
      { headers }
    );
  }

  /**
   * this method use for set data in localstorage
   *
   * @param name key name
   * @param value vlaue for key
   */
  setDatatoLocalStorage(name: string, value: string) {
    localStorage.setItem(`${name}`, value);
  }

  /**
   * use for get data from localstorage
   *
   * @param name key name
   * @returns string
   */
  getDatafromLocal(name: string) {
    return localStorage.getItem(name);
  }

  /**
   * Provide Login User data as an Observable
   */
  getUser(): Observable<User | null> {
    const user = localStorage.getItem('User');
    return of<User | null>(user ? JSON.parse(this.crypto.decrypt(user)) : null);
  }

  /**
   * handle logout
   *
   * @returns - string observable
   */
  logOut(): Observable<any> {
    const token = localStorage.getItem('Token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.post<any>(`${this.apiUrl}/logout`, null, { headers });
  }
}
