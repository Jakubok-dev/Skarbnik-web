import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { LOG_IN } from 'src/app/graphql/mutations/login';
import { AuthorisationService } from 'src/app/services/authorisation/authorisation.service';
import { HeadService } from 'src/app/services/head/head.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss']
})
export class LogInComponent implements OnInit {

  constructor(
    private authorisationService :AuthorisationService,
    private router :Router,
    private formBuilder :FormBuilder, 
    private apollo :Apollo, 
    private headService :HeadService
  ) { 
    this.headService.titlePrefix = `Zaloguj`;
  }

  logInForm :FormGroup;

  ngOnInit() {
    this.authorisationService.authorised.subscribe(res => {
      if (res)
        this.router.navigate([`/`]);
    });

    this.logInForm = this.formBuilder.group({
      username: ['', [
        Validators.required,
      ]],
      password: ['', [
        Validators.required,
      ]],
    });
  }

  get username() {
    return this.logInForm.get(`username`);
  }

  get password() {
    return this.logInForm.get(`password`);
  }

  submit() {
    this.apollo.mutate({
      mutation: LOG_IN,
      variables: {
        username: this.username.value,
        password: this.password.value,
      }
    }).subscribe(({ data }) => {
      if ((data as any)?.login)
        window.location.reload();
      else
        this.logInForm.setErrors({ 'failed': true });
    });
  }
}
