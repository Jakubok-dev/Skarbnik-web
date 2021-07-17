import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { LOG_OUT } from 'src/app/graphql/mutations/logout';
import { AuthorisationService } from 'src/app/services/authorisation/authorisation.service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {

  constructor(private authorisationService :AuthorisationService, private apollo :Apollo, private router :Router) {
  }

  get logged() {
    return this.authorisationService.authorised;
  }

  get user() {
    return this.authorisationService.user;
  }

  logOut() {
    this.apollo.mutate({ mutation: LOG_OUT })
    .subscribe(({ data }) => {
      if ((data as any).logout === true)
        window.location.reload();
    });
  }

  ngOnInit(): void {
  }

}
