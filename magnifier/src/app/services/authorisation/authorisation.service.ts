import { query } from '@angular/animations';
import { Injectable, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { ME } from 'src/app/graphql/queries/me';
import { Account } from 'src/app/graphql/types/account';

@Injectable({
  providedIn: 'root'
})
export class AuthorisationService {

  querySubscription ?:Subscription;
  private _user ?:Account;

  get user() {
    return this._user;
  }

  get authorised() {
    return this._user !== undefined && this._user !== null;
  }
  
  constructor(private apollo :Apollo) {

    this.querySubscription = this.apollo.watchQuery({ query: ME })
    .valueChanges
    .subscribe(({ data }) => {
      this._user = (data as any).me as Account;
      console.log(data);
    });
  }
}
