import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpinterceptorService implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    console.log(req)
    const token = localStorage.getItem('Token');

    // Check if the request URL matches your specific routes
    const isProductRoute = req.url.includes('/api/products'); // Example route check

    console.log(isProductRoute)
    // Clone the request to add the authorization header if the token exists and the route matches
    if (isProductRoute && token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // If the route does not match, pass the request without modification
    return next.handle(req);
  }
}