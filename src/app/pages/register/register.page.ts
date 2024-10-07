import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; 
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule] // Solo importa IonicModule una vez
})
export class RegisterPage {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      perfil: ['', [Validators.required]], // Nuevo campo para el perfil
      sexo: ['', [Validators.required]] // Nuevo campo para el sexo
    });
  }

  register() {
    if (this.registerForm.valid) {
      const { name, email, password, perfil, sexo } = this.registerForm.value;

      // Generar un id aleatorio o secuencial para el usuario (en este caso, por simplicidad, un valor fijo)
      const id = Date.now();  // Puedes usar cualquier método para generar el ID único

      this.authService.register(email, password, name, id, perfil, sexo) // Ahora pasamos los 6 parámetros
        .then(() => {
          console.log('Registro exitoso');
          this.router.navigate(['/login']);  // Redirige al login después del registro
        })
        .catch(error => {
          console.error('Error al registrarse:', error);
        });
    } else {
      console.error('Formulario inválido:', this.registerForm.value);
    }
  }
}