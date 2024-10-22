import { CommonModule } from '@angular/common';
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
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../Services/User/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { CryptoService } from '../../../../Services/crypto.service';
import { ToastService } from '../../../../Common/Service/toast.service';
import { LoaderService } from '../../../../Common/Service/loader.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private Encrypt = inject(CryptoService);
  private notify = inject(ToastService);
  loading = inject(LoaderService);

  /**
   * Instance of formdata
   */
  private formData = new FormData();

  /**
   * Hold user id
   *
   * @defaultValue 0
   */
  private userId = signal<number>(0);

  /**
   * this signal hold the profile image file
   */
  profileImage = signal<string>('../../../../../assets/images/user.png');

  /**
   * Hold value for error dispaly if form is invalid
   */
  submitted = signal<boolean>(false);

  /**
   * Takke element reference from html
   */
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  /**
   * Register Form initialization using reactive form
   */
  profileForm: FormGroup = this.fb.group({
    first_name: this.fb.control('', Validators.required),
    email: this.fb.control('', Validators.required),
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
   * This signal use for fetch get user data
   */
  getUserData = toSignal(
    this.auth.getUser().pipe(
      tap((user) => {
        this.loading.show();
        if (user) {
          this.userId.set(user.id);
          this.profileForm.get('first_name')?.setValue(user.first_name);
          this.profileForm.get('last_name')?.setValue(user.last_name);
          this.profileForm.get('email')?.setValue(user.email);
          this.profileForm.get('user_name')?.setValue(user.user_name);
          this.profileImage.set(user.profile_image);
          console.log(this.profileForm.value);
          this.loading.hide();
        } else {
          this.loading.hide();
        }
      })
    )
  );

  /**
   * This method use to display preview of profile pic on html
   *
   * @param event - Event of input change
   */
  previewImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.formData.append('profile_image', file);
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
  onSubmit(): void {
    this.loading.show();
    if (this.profileForm.valid) {
      this.formData.append('first_name', this.profileForm.value.first_name);
      this.formData.append('last_name', this.profileForm.value.last_name);
      this.formData.append('user_name', this.profileForm.value.user_name);
      this.formData.append('email', this.profileForm.value.email);
      console.log('FormData contents:');
      this.formData.forEach((value, key) => {
        console.log(key, value);
      });
      this.auth.updateUser(this.userId(), this.formData).subscribe((res) => {
        console.log(res);
        const encryptUSer = this.Encrypt.encrypt(JSON.stringify(res.user));
        this.auth.setDatatoLocalStorage('User', encryptUSer);
        this.notify.success('Profile updated!');
        this.loading.hide();
      });
    } else {
      console.log(this.profileForm.errors);
      console.log('form is invalid');
    }
  }
}
