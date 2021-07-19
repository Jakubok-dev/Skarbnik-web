import { Component } from '@angular/core';
import { HeadService } from './services/head/head.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent { 
  constructor(private headService :HeadService) {}
}
