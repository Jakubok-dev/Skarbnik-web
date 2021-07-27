import { Component, OnInit } from '@angular/core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { HeadService } from 'src/app/services/head/head.service';

@Component({
  selector: 'app-organisations',
  templateUrl: './organisations.component.html',
  styleUrls: ['./organisations.component.scss'],
})
export class OrganisationsComponent implements OnInit {

  constructor(private headService :HeadService) { }

  ngOnInit(): void {
    this.headService.descriptionPrefix = "Organizacje";
  }

  faSearch = faSearch;

  arr = new Array(10);
}
