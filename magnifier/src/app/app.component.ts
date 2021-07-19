import { Component, HostBinding } from '@angular/core';
import { HeadService } from './services/head/head.service';
import { ThemeService } from './services/theme/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent { 
  constructor(private headService :HeadService) {}
}
