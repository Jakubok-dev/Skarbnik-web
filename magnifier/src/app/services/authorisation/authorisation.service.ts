import { Injectable, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { HAS_PERMISSIONS } from 'src/app/graphql/queries/hasPermissions';
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

  permitted(permissions :String[]) {
    return this._user.pipe(mergeMap(user => {
      return this.apollo.watchQuery({ 
        query: HAS_PERMISSIONS,
        variables: {
          permissions,
        } 
      })
      .valueChanges
      .pipe(map(answers => {

        console.log(user, answers);

        if (user === null || user === undefined)
          return false;

        let permitted = true;

        for (let answer of (answers as any).data.hasPermissions as boolean[]) {
          if (!answer) {
            permitted = false;
            break;
          }
        }

        return permitted;
      }));
    }));
  }
}
