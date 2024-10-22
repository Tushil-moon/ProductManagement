import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  /**
   * Hold loading status
   *
   * @defaultValue false
   */
  _isLoading = new BehaviorSubject<boolean>(false);

  /**
   * convert behaviour subject to observable
   */
  isLoading$ = this._isLoading.asObservable();

  /**
   * change status to true
   */
  show() {
    this._isLoading.next(true);
  }

  /**
   * Change status to false
   */
  hide() {
    this._isLoading.next(false);
  }
}
