import {
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../Services/User/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../Common/Service/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink,CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private notify = inject(ToastService);
  private router = inject(Router);
  isLoading = true;

  /**
   * This signal hold boolean value for preventation form submit on invalid form
   */
  submitted = signal<boolean>(false);

  /**
   * this signal hold the profile image file
   */
  profileImage = signal<string>('../../../../../assets/images/user.png');

  /**
   * Hold profile image file
   */
  imageFile = signal<File | null>(null);

  /**
   * Takke element reference from html
   */
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  /**
   * Register Form initialization using reactive form
   */
  registerForm: FormGroup = this.fb.group({
    first_name: this.fb.control('', Validators.required),
    email: this.fb.control('', Validators.required),
    password: this.fb.control('', Validators.required),
    password_confirmation: this.fb.control('', Validators.required),
    last_name: this.fb.control('', Validators.required),
    user_name: this.fb.control('', Validators.required),
  });

  /**
   * Method use for open input element and take image
   */
  editImage(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * This method use to display preview of profile pic on html
   *
   * @param event - Event of input change
   */
  previewImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.imageFile.set(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage.set(reader.result as string);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  /**
   * This method use to handle user registration
   */
  onRegister(): void {
    if (this.registerForm.valid) {
      const formData = new FormData();
      if (this.imageFile()) {
        formData.append('profile_image', this.imageFile()!);
      }
      formData.append('first_name', this.registerForm.value.first_name);
      formData.append('last_name', this.registerForm.value.last_name);
      formData.append('user_name', this.registerForm.value.user_name);
      formData.append('email', this.registerForm.value.email);
      formData.append('password', this.registerForm.value.password);
      formData.append(
        'password_confirmation',
        this.registerForm.value.password_confirmation
      );
      console.log('FormData contents:');
      formData.forEach((value, key) => {
        console.log(key, value);
      });
      this.auth.registerUser(formData).subscribe(
        (res) => {
          this.notify.success('Register successfully');
          this.router.navigate(['/login']);
        },
        (err) => {
          this.notify.error(err);
        }
      );
    } else {
      console.log(this.registerForm.errors);
      this.notify.warning('Please fill the all required field');
      this.submitted.set(true);
    }
  }
}
