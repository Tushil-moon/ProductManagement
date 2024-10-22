import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-infinite',
  standalone: true,
  imports: [CommonModule, InfiniteScrollModule],
  templateUrl: './infinite.component.html',
  styleUrl: './infinite.component.css',
})
export class InfiniteComponent {
  array: any[] = [];
  sum = 100;
  throttle = 3000;
  scrollDistance = 1;
  scrollUpDistance = 2;
  direction = '';


  constructor() {
    this.appendItems(0, this.sum);
  }
  

  addItems(startIndex: number, endIndex: number, _method: 'push' | 'unshift') {
    for (let i = startIndex; i < endIndex; ++i) {
      const va = `${i} ${this.generateWord()}`;
      if (_method === 'push') {
        this.array.push(va); // Add item to the end of the array
      } else if (_method === 'unshift') {
        this.array.unshift(va); // Add item to the start of the array
      }
    }
  }
  generateWord(): string {
    const words = ['apple', 'banana', 'cherry', 'date', 'fig', 'grape'];
    return words[Math.floor(Math.random() * words.length)];
  }

  appendItems(startIndex: number, endIndex: number) {
    this.addItems(startIndex, endIndex, 'push');
  }

  prependItems(startIndex: number, endIndex: number) {
    this.addItems(startIndex, endIndex, 'unshift');
  }

  onScrollDown(ev?: any) {
    console.log('scrolled down!!', ev);

    // add another 20 items  
    const start = this.sum;
    this.sum += 20;
    this.appendItems(start, this.sum);

    this.direction = 'down';
  }

  onUp(ev?: any) {
    console.log('scrolled up!', ev);
    const start = this.sum;
    this.sum += 20;
    this.prependItems(start, this.sum);

    this.direction = 'up';
  }
}
const example = new InfiniteComponent();
example.appendItems(0,example.sum);  // Call the method to append items
console.log(example.array);