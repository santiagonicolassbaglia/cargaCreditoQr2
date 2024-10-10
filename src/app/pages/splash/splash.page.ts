import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSpinner, IonButton, IonItem } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonItem, IonButton, IonSpinner, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SplashPage implements OnInit {

  constructor(private router: Router) {}  // Inyectamos Router correctamente

  ngOnInit() {
    setTimeout(() => {
      this.router.navigate(['/login']);  // Redirige al login después de 3.5 segundos
    }, 3500);
  }

}
