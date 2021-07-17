import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { AuthorisationService } from 'src/app/services/authorisation/authorisation.service';
import { ThemeService } from 'src/app/services/theme/theme.service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {

  constructor(private authorisationService :AuthorisationService) {
  }

  get logged() {
    return this.authorisationService.authorised;
  }

  get user() {
    return this.authorisationService.user;
  }

  ngOnInit(): void {
  }

}
