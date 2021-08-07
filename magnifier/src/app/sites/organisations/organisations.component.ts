import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {  MatPaginator, PageEvent } from '@angular/material/paginator';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Apollo } from 'apollo-angular';
import { ORGANISATIONS_COUNT } from 'src/app/graphql/queries/organisationsCount';
import { ORGANISATIONS_NAMES } from 'src/app/graphql/queries/organisationsNames';
import { Organisation } from 'src/app/graphql/types/organisation';
import { HeadService } from 'src/app/services/head/head.service';

@Component({
  selector: 'app-organisations',
  templateUrl: './organisations.component.html',
  styleUrls: ['./organisations.component.scss'],
})
export class OrganisationsComponent implements OnInit {

  constructor(private headService :HeadService, private apollo :Apollo, private formBuilder :FormBuilder) { }
  
  searchForm :FormGroup;
  organisations :Organisation[] = [];
  organisationsCount = 0;

  @ViewChild('paginator')
  paginator :MatPaginator;

  ngOnInit(): void {
    this.headService.descriptionPrefix = "Organizacje";

    this.searchForm = this.formBuilder.group({
      textBox: '',
    });

    this.searchForm.get(`textBox`)
    .valueChanges
    .subscribe(() => {
      this.paginator.page.emit({
        pageIndex: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize,
        length: this.paginator.length,
      });
    });

    this.apollo.watchQuery({
      query: ORGANISATIONS_COUNT,
      variables: {
        contains: this.searchForm.get(`textBox`).value,
      }
    })
    .valueChanges
    .subscribe(({ data }) => {
      this.organisationsCount = (data as any).organisationsCount;
    });

    this.apollo.watchQuery({
      query: ORGANISATIONS_NAMES,
      variables: {
        alphabetical: true,
        limit: 10,
        cursor: 0,
      }
   })
   .valueChanges
   .subscribe(({ data }) => {
     this.organisations = (data as any).organisations;
   });

  }

  getServerData(event ?:PageEvent) {
    this.apollo.watchQuery({
      query: ORGANISATIONS_COUNT,
      variables: {
        contains: this.searchForm.get(`textBox`).value,
      }
    })
    .valueChanges
    .subscribe(({ data }) => {
      this.organisationsCount = (data as any).organisationsCount;
    });
    
    this.apollo.watchQuery({
      query: ORGANISATIONS_NAMES,
      variables: {
        alphabetical: true,
        limit: event.pageSize + event.pageIndex * event.pageSize,
        cursor: event.pageIndex * event.pageSize,
        contains: this.searchForm.get(`textBox`).value,
      }
   })
   .valueChanges
   .subscribe(({ data }) => {
     this.organisations = (data as any).organisations;
   });
  }

  faSearch = faSearch;

  arr = new Array(10);
}
