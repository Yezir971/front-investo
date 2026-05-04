import { Component, OnInit } from '@angular/core';
import { Resource } from '../../resources/resources';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  public isMenuOpen=true;
  public userName = "james"
  public resource=new Resource();

  ngOnInit(): void {
    
  }
  logout(){
    localStorage.clear();
  }
}
