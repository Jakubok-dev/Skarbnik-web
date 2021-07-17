import { ElementRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { faMoon, faSun } from '@fortawesome/free-regular-svg-icons';
import { ThemeService } from 'src/app/services/theme/theme.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {

  constructor(private themeService :ThemeService, private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.themeService.loadTheme(this.elementRef);
  }

  get darkMode() { return this.themeService.darkMode; }

  toggleDarkMode() {
    this.themeService.darkMode = !this.themeService.darkMode;
    this.themeService.loadTheme(this.elementRef);
  }

  faMoon = faMoon;
  faSun = faSun;
}
