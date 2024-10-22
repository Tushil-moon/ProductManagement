import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('Token');
  // Check if the request URL matches your specific routes
  const isProductRoute = req.url.includes('/api/products'); // Example route check
  // Clone the request to add the authorization header if the token exists and the route matches
  if (isProductRoute && token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  // If the route does not match, pass the request without modification
  return next(req);
};
