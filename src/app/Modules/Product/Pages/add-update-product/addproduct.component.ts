import {
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductService } from '../../../../Services/Product/product.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  catchError,
  filter,
  finalize,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Products } from '../../Models/productResponse';
import { LoaderService } from '../../../../Common/Service/loader.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../Common/Service/toast.service';

@Component({
  selector: 'app-addproduct',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './addproduct.component.html',
  styleUrl: './addproduct.component.css',
})
export class AddproductComponent {
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  loading = inject(LoaderService);

  /**
   * This signal hold boolean value for preventation form submit on invalid form
   */
  submitted = signal<boolean>(false);

  /**
   * this signal hold the profile image file
   */
  productImage = signal<string>(
    '../../../../../assets/images/empty-300x240.jpg'
  );

  /**
   * Hold profile image file
   */
  imageFile = signal<File | null>(null);

  /**
   * take behaviour subject with initial value false
   */
  _productById$ = new BehaviorSubject<Products | null>(null);

  /**
   * take subject as observable
   */
  productById$ = this._productById$.asObservable();

  /**
   * setter method for set product in subject
   */
  set productById(value: Products) {
    this._productById$.next(value);
  }

  /**
   * Takke element reference from html
   */
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  /**
   * intialize form using reactive form module
   */
  productForm: FormGroup = this.fb.group({
    price: this.fb.control('', Validators.required),
    description: this.fb.control('', Validators.required),
    slug: this.fb.control('', Validators.required),
    name: this.fb.control('', Validators.required),
  });

  /**
   * take id from active route param and get product by id and patch the product value to form
   */
  getProductId = toSignal(
    this.route.paramMap.pipe(
      tap(() => this.loading.show()),
      map((param) => {
        const id = param.get('id');
        return id ? Number(id) : null;
      }),
      tap((id) => {
        if (id === null) {
          this.loading.hide();
        }
      }),
      filter((id) => id !== null),
      switchMap((id: number) => this.productService.getProductById(id)),
      tap((res: Products) => {
        this.productById = res;
        this.productImage.set(res.image);
        console.log(res);
        if (res) {
          this.productForm.patchValue(res);
          this.loading.hide();
        } else {
          this.loading.hide();
        }
      })
    )
  );

  /**
   * This method use to display preview of Producrt image on template
   *
   * @param event - Event of file input change
   */
  imagePreview(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.imageFile.set(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.productImage.set(reader.result as string);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  /**
   * use for open input to select image
   */
  addImage(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * This method use to add and update product in database
   */
  onSubmit(): void {
    this.loading.show();
    if (this.productForm.valid) {
      const formData = new FormData();
      if (this.imageFile()) {
        formData.append('image', this.imageFile()!);
      }
      formData.append('name', this.productForm.value.name);
      formData.append('slug', this.productForm.value.slug);
      formData.append('description', this.productForm.value.description);
      formData.append('price', this.productForm.value.price);

      // Log form data for debugging
      // formData.forEach((value, key) => {
      //   console.log(key, value);
      // });
      const productId = this._productById$.value?.id;
      if (productId) {
        this.productService.handleUpdateProduct(productId, formData).subscribe(
          (res) => {
            this.router.navigate(['/home']);
            this.loading.hide();
            this.toast.success('Product updated successfully!');
          },
          (err) => {
            this.toast.error(err.error.message);
            this.loading.hide();
          }
        );
      } else {
        this.productService.handleAddProduct(formData).subscribe(
          (res) => {
            console.log('Product added:', res);
            this.router.navigate(['/product-list']);
            this.toast.success('Product added successfully!');
            this.loading.hide();
          },
          (err) => {
            this.toast.error(err.error.message);
            this.loading.hide();
          }
        );
      }
    } else {
      this.submitted.set(true);
      console.log('Form validation errors:', this.productForm.errors);
      this.toast.warning('Please fill in the required fields correctly.');
      this.loading.hide();
    }
  }
}
