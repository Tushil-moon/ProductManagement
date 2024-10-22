import {
  Component,
  inject,
  InjectionToken,
  signal,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, flatMap, mergeMap, switchMap, tap } from 'rxjs';
import { ProductService } from '../../../../Services/Product/product.service';
import { Products, PaginatedResponse } from '../../Models/productResponse';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../../../Common/Service/loader.service';
import { ToastService } from '../../../../Common/Service/toast.service';
import {
  VirtualScrollStrategy,
  VIRTUAL_SCROLL_STRATEGY,
} from '@angular/cdk/scrolling';
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from '@angular/cdk/scrolling';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, CommonModule, ScrollingModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent {
  private product = inject(ProductService);
  private loader = inject(LoaderService);
  private notify = inject(ToastService);
  @ViewChild(CdkVirtualScrollViewport)
  viewport!: CdkVirtualScrollViewport;

  lastScrollPosition = 0;
  /**
   * hold product id
   *
   * @defaultValue 0
   */
  productId = signal<number>(0);

  /**
   * This behaviour subject hold the product list data
   */
  _response$ = new BehaviorSubject<PaginatedResponse[]>([]);

  /**
   * Take behaviour subject as observable to store data
   */
  private response$ = this._response$.asObservable();

  /**
   * setter use for set product data in behaviour subject
   *
   * @param - product data
   */
  set response(product: PaginatedResponse[]) {
    this._response$.next(product);
  }

  /**
   * hold the value for triggerd product api manually
   */
  _refreshList$ = new BehaviorSubject<boolean>(false);

  /**
   * Take behaviour subject as observable to store data
   */
  private refreshList$ = this._refreshList$.asObservable();

  /**
   * setter method for refreshList observable
   */
  set refreshList(value: boolean) {
    this._refreshList$.next(value);
  }

  onScroll(index: number): void {
    if (this.viewport && index > 0) {
      const currentPosition = this.viewport.measureScrollOffset();
      const isScrollingUp = currentPosition < this.lastScrollPosition;
      this.lastScrollPosition = currentPosition;
      console.log("currentPosition",currentPosition)
      console.log("isScrollingUp",isScrollingUp)

      console.log("lastScrollPosition",this.lastScrollPosition)

  
      // const totalItems = this._response$.value[0].total;
      // const currentPage = this._response$.value[0].current_page;
      // const perPage = this._response$.value[0].per_page;
  
      // // Get the total number of rendered items
      // const totalRendered = this.viewport.getRenderedRange().end;
  
      // // Get viewport and scrollable content dimensions
      // const scrollHeight = this.viewport.getDataLength();  // Total length of data
      // const viewportHeight = this.viewport.getViewportSize();  // Viewport size
      
      // const scrollThreshold = 0.1 * scrollHeight; // Set a threshold at 10% before the end
      // console.log(scrollThreshold)
  
      // console.log("index", index);
      // console.log("scrollHeight", scrollHeight, "viewportHeight", viewportHeight);
      // console.log("currentPosition", currentPosition, "totalRendered", totalRendered);
      
      // Scroll Down: Load next page when nearing the end
      if (!isScrollingUp && (currentPosition >= 200)) {
        // When close to the bottom, load next page
        // if (this._response$.value[0].next_page_url) {
          console.log("Fetching next page");
          this.loadPage(this._response$.value[0].next_page_url, 'append');
        // }
      }
  
      // Scroll Up: Load previous page when nearing the top
      if (isScrollingUp && (currentPosition <= 199)) {
        console.log('hello')
        // When close to the top, load previous page
        // if (this._response$.value[0].prev_page_url) {
          console.log("Fetching previous page");
          this.loadPage(this._response$.value[0].prev_page_url, 'prepend');
        // }
      }
    }
  }
  

  /**
   * Convert observable to signal for fetch data from server
   */
  getAllProduct = toSignal(
    this._refreshList$.pipe(
      switchMap(() => this.product.getAllProducts()),
      tap((product: PaginatedResponse) => {
        console.log('================', product);
        this.response = [product];
        this.loader.hide();
      })
    )
  );

  /**
   * this method use for pagination
   *
   * @param pageUrl page url
   */
  loadPage(pageUrl: string | null, operation: 'append' | 'prepend'): void {
    if (!pageUrl) return;

    this.product.nextPageProduct(pageUrl).subscribe((response: any) => {
      console.log(response);
      if (operation === 'append') {
        response.data.forEach((data: any) => {
          this._response$.value[0].data.push(data);
        });

        console.log(this._response$.value);
      } else {
        this.response = [response.data, ...this._response$.value[0].data];
      }
      console.log('Page loaded:', response);
      this.loader.hide();
    });
  }

  /**
   * Handle product id
   *
   * @param id product id to be delete
   */
  getDeleteID(id: number): void {
    console.log(id);
    this.productId.set(id);
  }

  /**
   * Handle product deletion
   */
  onDelete(): void {
    console.log(this.productId());
    this.product.handleDeleteProduct(this.productId()).subscribe(
      (response) => {
        const modal = document.getElementById('deleteProductModal');
        if (modal) {
          (modal as any).modal('hide');
        }
        console.log('Product deleted successfully', response);
        this.notify.success('Product deleted successfully!');
        this.refreshList = true;
      },
      (error) => {
        console.error('Error deleting product', error);
        this.notify.error('Error deleting product');
      }
    );
  }
}
