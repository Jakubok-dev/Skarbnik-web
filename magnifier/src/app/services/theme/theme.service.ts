import { ElementRef, Injectable } from '@angular/core';
import { CookiesService } from '../cookies/cookies.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor(private cookiesService :CookiesService) {
    if (cookiesService.getCookie(`dark-mode`) === 'false')
      this.darkMode = false;
  }

  darkMode = true;

  loadTheme(elementRef: ElementRef) {
    if (this.darkMode) {
      elementRef.nativeElement.ownerDocument.body.classList.remove(`theme-light`);
      elementRef.nativeElement.ownerDocument.body.classList.add(`theme-dark`);
      return;
    }

    elementRef.nativeElement.ownerDocument.body.classList.remove(`theme-dark`);
    elementRef.nativeElement.ownerDocument.body.classList.add(`theme-light`);
  }

  toggleTheme(elementRef: ElementRef) {
    this.darkMode = !this.darkMode;
    this.cookiesService.setCookie(`dark-mode`, booleanToString(this.darkMode));

    if (this.darkMode) {
      elementRef.nativeElement.ownerDocument.body.classList.remove(`theme-light`);
      elementRef.nativeElement.ownerDocument.body.classList.add(`theme-dark`);
      return;
    }

    elementRef.nativeElement.ownerDocument.body.classList.remove(`theme-dark`);
    elementRef.nativeElement.ownerDocument.body.classList.add(`theme-light`);
  }
}


const booleanToString = (bool :boolean) => bool === true ? 'true' : 'false';