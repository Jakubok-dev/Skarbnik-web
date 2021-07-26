import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from './guards/permission-guard.guard';
import { HomeComponent } from './sites/home/home.component';
import { LogInComponent } from './sites/log-in/log-in.component';
import { OrganisationsComponent } from './sites/organisations/organisations.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LogInComponent },
  { 
    path: 'organisations', 
    component: OrganisationsComponent,
    canActivate: [ PermissionGuard ],
    data: { permissions: [`SEE_EVERYONES_DATA`] }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
