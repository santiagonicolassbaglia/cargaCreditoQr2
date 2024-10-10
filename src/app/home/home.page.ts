import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCardContent, IonCard } from '@ionic/angular/standalone';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AuthService } from '../services/auth.service';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonCard, IonCardContent, IonButton, IonHeader, IonToolbar, IonTitle, IonContent,NgIf],
})
export class HomePage implements OnInit {

  creditosAcumulados: number = 0; // Almacenar los créditos
  contadorCreditosAdmin: { [key: string]: number } = {}; // Contador para admin por cada código QR
  mensaje: string = ''; // Para mostrar mensajes

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      try {
        // Cargar los datos del usuario al iniciar la aplicación
        const userData = await this.authService.getUserData(user.uid);
        if (userData) {
          this.creditosAcumulados = userData['creditos'] || 0;
          this.contadorCreditosAdmin = userData['contadorCreditosAdmin'] || {};
        }
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
        this.mensaje = 'Error al cargar los datos.';
      }
    } else {
      this.mensaje = 'Debes estar autenticado para acceder a los créditos.';
    }
  }

  async scanQrCode() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.mensaje = 'Debes estar autenticado para escanear códigos QR.';
      return;
    }

    try {
      const result = await BarcodeScanner.scan();
      console.log('Scanned QR result: ', result);

      if (result?.barcodes?.length > 0) {
        const qrContent = result.barcodes[0].displayValue.trim(); // Limpiar espacios
        const creditos = this.getCreditosPorCodigo(qrContent);
        if (creditos > 0) {
          try {
            await this.authService.agregarCreditos(user.uid, qrContent, creditos);
            
            // Recargar los datos de créditos después de agregar
            const userData = await this.authService.getUserData(user.uid);
            if (userData) {
              this.creditosAcumulados = userData['creditos'];
              this.contadorCreditosAdmin = userData['contadorCreditosAdmin'] || {};
              this.mensaje = 'Créditos agregados correctamente.';
            }
          } catch (error) {
            console.error('Error al agregar créditos:', error);
            this.mensaje = (error as Error).message;
          }
        } else {
          this.mensaje = 'Código QR no válido.';
        }
      } else {
        this.mensaje = 'No se encontró un código QR.';
      }
    } catch (error) {
      console.error('Error scanning QR code: ', error);
      this.mensaje = 'Error al escanear el código QR.';
    }
  }

  // Método para obtener créditos según el código QR
  getCreditosPorCodigo(codigoQR: string): number {
    const codigos: { [key: string]: number } = {
      '8c95def646b6127282ed50454b73240300dccabc': 10,
      'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172': 50,
      '2786f4877b9091dcad7f35751bfcf5d5ea712b2f': 100,
    };
    return codigos[codigoQR.trim().toLowerCase()] || 0;
  }

  async limpiarCreditos() {
    const user = this.authService.getCurrentUser();
    if (user) {
      await this.authService.limpiarCreditos(user.uid);
      this.creditosAcumulados = 0; // Resetear el visor de créditos
      this.contadorCreditosAdmin = {}; // Resetear el contador de admin
      this.mensaje = 'Créditos limpiados.';
    }
  }

  logout() {
    this.authService.logout().then(() => {
      this.mensaje = 'Sesión cerrada exitosamente.';
      this.router.navigate(['/login']);
    }).catch((error) => {
      this.mensaje = 'Error al cerrar sesión.';
    });
  }

}