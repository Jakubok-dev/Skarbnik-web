import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthorisationService } from '../services/authorisation/authorisation.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(private authService :AuthorisationService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const permissions = route.data.permissions as String[];
    const result = this.authService.permitted(permissions);
    result.subscribe(data => { if (data === false) alert(`Nie masz uprawnień, by odwiedzić tą stronę`); });
    return result;
  }
  
}
