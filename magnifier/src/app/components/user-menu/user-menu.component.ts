import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { LOG_OUT } from 'src/app/graphql/mutations/logout';
import { Account } from 'src/app/graphql/types/account';
import { AuthorisationService } from 'src/app/services/authorisation/authorisation.service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {

  constructor(private authorisationService :AuthorisationService, private apollo :Apollo, private router :Router) {
  }

  user :Account;

  get logged() {
    return this.user !== undefined && this.user !== null;
  }

  logOut() {
    this.apollo.mutate({ mutation: LOG_OUT })
    .subscribe(({ data }) => {
      if ((data as any).logout === true)
        window.location.reload();
    });
  }

  ngOnInit(): void {
    this.authorisationService.user.subscribe(user => this.user = user);
  }

}
