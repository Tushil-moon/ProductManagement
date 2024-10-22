import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../../Services/User/auth.service';
import {
  NonNullableFormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ApiResponse } from '../../Models/apires';
import { Router, RouterLink } from '@angular/router';
import { CryptoService } from '../../../../Services/crypto.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../Common/Service/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private Encrypt = inject(CryptoService);
  private toast = inject(ToastService);

  /**
   * This signal hold boolean value for preventation form submit on invalid form
   */
  submitted = signal<boolean>(false);

  /**
   * Login Form initialization using reactive form
   */
  loginForm: FormGroup = this.fb.group({
    email: this.fb.control('', Validators.required),
    password: this.fb.control('', Validators.required),
  });

  /**
   * This method use to handle user logging in
   */
  onLogin(): void {
    // Check if the form is valid
    if (this.loginForm.valid) {
      this.auth.loginUser(this.loginForm.value).subscribe(
        (res: ApiResponse) => {
          if (res && res.token) {
            // Login success, store user and token in localStorage
            console.log('Login successful:', res);
            const encryptUser = this.Encrypt.encrypt(JSON.stringify(res.user));
            const token = res.token;
            this.auth.setDatatoLocalStorage('User', encryptUser);
            this.auth.setDatatoLocalStorage('Token', token);
            this.router.navigate(['/home']);
            this.toast.success('Login successful!');
          } else {
            // Handle the case where the token or user info is missing
            console.error('No token or user information found in the response');
            this.toast.error('Invalid response from server. Please try again.');
          }
        },
        (err) => {
          console.log("error=========",err);
          // Handle server or network error response
          if (err.status === 401) {
            this.toast.error(err.error.message);
          } else if (err.status === 500) {
            this.toast.error('Server error. Please try again later.');
          } else if (err.status === 0) {
            // Handle network error (e.g., no internet connection)
            this.toast.error(
              'Network error. Please check your internet connection.'
            );
          } else {
            // Handle other unknown errors
            console.error('Unexpected error:', err);
            this.toast.error(
              'An unexpected error occurred. Please try again later.'
            );
          }
        }
      );
    } else {
      // Form is invalid, mark all fields as touched to show validation errors
      this.submitted.set(true);
      this.loginForm.markAllAsTouched();
      console.log('Form validation errors:', this.loginForm.errors);
      this.toast.warning('Please fill in the required fields correctly.');
    }
  }
}
