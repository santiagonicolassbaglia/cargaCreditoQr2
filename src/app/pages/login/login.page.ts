import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Importar el servicio de autenticación
import { Auth } from '@angular/fire/auth';

  // Asegúrate de tener un servicio de autenticación

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule] 
})
export class LoginPage implements OnInit {
  ngOnInit() {
    this.loginForm.reset(); // Asegurarse de que los campos están vacíos
  }

  loginForm: FormGroup;

  // Usuarios de ingreso rápido
  quickUsers = [
    { id: 1, correo: 'admin@admin.com', clave: 111111 },
    { id: 2, correo: 'invitado@invitado.com', clave: 222222 },
    { id: 3, correo: 'usuario@usuario.com', clave: 333333 },
    { id: 4, correo: 'anonimo@anonimo.com', clave: 444444 },
    { id: 5, correo: 'tester@tester.com', clave: 555555 }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Autocompletar el formulario con el correo y la clave seleccionados
  fillForm(user: { correo: string, clave: number }) {
    this.loginForm.patchValue({
      email: user.correo,
      password: user.clave.toString()
    });
  }

  login() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).then(() => {
        this.router.navigate(['/home']);
        this.loginForm.reset(); // Resetear el formulario después de iniciar sesión exitosamente
      }).catch(error => {
        console.error('Login fallido', error);
      });
    }
  }

  // Redirigir a la página de registro
  goToRegister() {
    this.router.navigate(['/register']);  // Navegar a la página de registro
  }
}
