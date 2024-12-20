import { LoginService } from "./login.service";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate{
  constructor(private loginService:LoginService, private router:Router){

  }

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
      if(this.loginService.isLoggedIn() && this.loginService.getUserRole() == 'ADMIN'){
        return true;
      }
      this.router.navigate(['login']);
      return false;
  }
}
