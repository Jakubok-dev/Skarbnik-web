import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CookiesService } from 'src/app/services/cookies/cookies.service';

@Component({
  selector: 'app-cookie-consent',
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.scss'],
})
export class CookieConsentComponent implements OnInit {

  constructor(private cookiesService :CookiesService) { }

  ngOnInit(): void {
    if (this.cookiesService.getCookie(`cookie-consent`) === 'true')
      this.consented = true;
  }

  consented :boolean = false;

  consent() {
    this.cookiesService.setCookie(`cookie-consent`, 'true');
    this.consented = true;
  }
}
