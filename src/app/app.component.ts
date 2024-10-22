import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegisterComponent } from './Modules/User/Pages/register/register.component';
import { NgToastModule } from 'ng-angular-popup';
import { ToasterPosition } from 'ng-toasty';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RegisterComponent,NgToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'ProductManagement';
  ToasterPosition = ToasterPosition;
}
