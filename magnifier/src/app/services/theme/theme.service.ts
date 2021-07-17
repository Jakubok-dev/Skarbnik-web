import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() { }

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
}
