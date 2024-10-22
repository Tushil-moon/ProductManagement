import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';;

export const protectedGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('Token');

  // console.log(token);
  if (token) {
    router.navigate(['/home']);
    return false;
  } else {
    return true;
  }
};
