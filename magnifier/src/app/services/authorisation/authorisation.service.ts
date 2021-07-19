import { Injectable, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ME } from 'src/app/graphql/queries/me';
import { Account } from 'src/app/graphql/types/account';

@Injectable({
  providedIn: 'root'
})
export class AuthorisationService {

  querySubscription ?:Subscription;
  loading = true;
  private _user ?:Observable<Account>;

  get user() {
    return this._user;
  }

  get authorised() {
    return this._user.pipe(map( user => user !== undefined && user !== null ));
  }
  
  constructor(private apollo :Apollo) {

    this._user = this.apollo.watchQuery({ query: ME })
    .valueChanges
    .pipe(map(response => (response.data as any).me as Account));
    // .subscribe(({ data, loading }) => {
    //   this.loading = loading;
    //   this._user = (data as any).me as Account;
    // });
  }
}
