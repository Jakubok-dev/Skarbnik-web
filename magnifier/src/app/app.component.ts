import { Component, HostBinding } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private themeService :ThemeService) {}

  @HostBinding(`class`)
  get themeMode() {
    return this.themeService.darkMode ? `theme-dark` : `theme-light`;
  }
}
