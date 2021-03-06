import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/solid.auth.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private auth:AuthService) { }

  ngOnInit() {
  }

  logout(){
    console.log("logout");
    this.auth.solidSignOut();
  }

  isLogged(){
    if(localStorage.getItem('solid-auth-client')){
      return true;
    } else{
      return false;
    }
  }
}
