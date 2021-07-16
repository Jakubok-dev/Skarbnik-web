import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  constructor(private apollo :Apollo) {}

  data :any;
  
  ngOnInit(): void {
    this.apollo.watchQuery({
      query: gql`
        {
          me {
            id
            createdAt
            updatedAt
            username
            email
            person {
              id
              createdAt
              updatedAt
              name
              surname
              dateOfBirth
              age
            }
            permissionsManager {
              id
              createdAt
              updatedAt
              permissions
              _permissionGroupType
            }
            group {
              id
              createdAt
              updatedAt
              name
              description
            }
          }
        }
      `
    })
    .valueChanges.subscribe((result :any) => this.data = JSON.stringify(result));
  }
  title = 'magnifier';
}
