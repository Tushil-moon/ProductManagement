import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { tap } from 'rxjs';
import { AuthService } from '../../../../Services/User/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  profileImage = signal<string>('../../../../../assets/images/user.png');

  /**
   * Get Login user data from auth service
   */
  getUserData = toSignal(
    this.auth.getUser().pipe(
      tap((user) => {
        return user;
      })
    )
  );

  /**
   * Handle user login
   */
  logout(): void {
    this.auth.logOut().subscribe((message) => {
      console.log(message);
      localStorage.removeItem('User');
      localStorage.removeItem('Token');
      this.router.navigate(['/login']);
    });
  }
}
