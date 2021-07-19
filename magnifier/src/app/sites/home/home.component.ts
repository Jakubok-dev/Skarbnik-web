import { Component, OnInit } from '@angular/core';
import { HeadService } from 'src/app/services/head/head.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private headService :HeadService) { 
    headService.titlePrefix = "Strona Główna";
  }

  ngOnInit(): void {
  }

}
