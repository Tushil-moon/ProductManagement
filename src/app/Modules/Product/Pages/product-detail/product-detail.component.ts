import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap, tap } from 'rxjs';
import { ProductService } from '../../../../Services/Product/product.service';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../../../Common/Service/loader.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  loading = inject(LoaderService);

  /**
   * take id from active route param and get product by id
   */
  getProductById = toSignal(
    this.route.paramMap.pipe(
      tap(() => this.loading.show()),
      map((param) => Number(param.get('id')) || 0),
      switchMap((id: number) => this.productService.getProductById(id)),
      tap(() => this.loading.hide())
    )
  );
}
