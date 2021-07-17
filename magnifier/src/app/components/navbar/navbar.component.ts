import { ElementRef, HostBinding, ViewEncapsulation } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { faMoon, faSun } from '@fortawesome/free-regular-svg-icons';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements OnInit {

  constructor(private themeService :ThemeService) { }

  ngOnInit(): void {
  }

  get darkMode() { return this.themeService.darkMode; }

  toggleDarkMode() {
    this.themeService.darkMode = !this.themeService.darkMode;
  }

  faMoon = faMoon;
  faSun = faSun;
}
