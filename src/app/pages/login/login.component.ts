import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../model/User';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private http: HttpClient, private router: Router){}
  
  private authUrl:string = 'http://localhost:8080/auth/login';
  private registerUrl:string = 'http://localhost:8080/auth/register';

  user: any = {
    "email": "",
    "password": ""
  };

  newUser: User = new User();

  onLogin(){
    this.http.post(this.authUrl, this.user).subscribe((response:any) => {
      if(localStorage.getItem('loginToken')){
        localStorage.removeItem('loginToken');
      }
      if(response.token){
        localStorage.setItem('loginToken', response.token);
        localStorage.setItem('userAuthenticated', this.user.email);
        this.router.navigateByUrl('/posts');
      }
    }, error => alert("Erro ao realizar o login! Verifique suas credenciais e tente novamente."));
  }

  createUser(){
    if(localStorage.getItem('loginToken')){
      localStorage.removeItem('loginToken');
    }
    if(localStorage.getItem('userAuthenticated')){
      localStorage.removeItem('userAuthenticated');
    }
    this.http.post(this.registerUrl, this.newUser).subscribe((response:any) => {
      this.user = {"email": this.newUser.email, "password": this.newUser.password};
      this.newUser = new User();
      alert('Usuário cadastrado!');
      this.onLogin();
    });
  }

}
