import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCardContent, IonCard } from '@ionic/angular/standalone';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonCard, IonCardContent, IonButton, IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage {
  creditosAcumulados: number = 0; // Estado para almacenar los créditos

  constructor(private authService: AuthService) {}

  async scanQrCode() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      alert('Debes estar autenticado para escanear códigos QR.');
      return;
    }
  
    try {
      const result = await BarcodeScanner.scan();
      console.log('Scanned QR result: ', result);
  
      if (result?.barcodes?.length > 0) {
        const qrContent = result.barcodes[0].displayValue.trim(); // Limpiar espacios
        console.log('Contenido del QR: ', qrContent);
  
        const creditos = this.getCreditosPorCodigo(qrContent);
        if (creditos > 0) {
          try {
            await this.authService.agregarCreditos(user.uid, qrContent, creditos);
            console.log('Créditos agregados correctamente');
  
            const userDoc = await this.authService.getUserData(user.uid);
            if (userDoc) {
              this.creditosAcumulados = userDoc['creditos'];
              console.log('Créditos acumulados: ', this.creditosAcumulados);
            }
          } catch (error) {
            console.error('Error al agregar créditos:', error);
            alert((error as Error).message);  // Mostrar mensaje de error
          }
        } else {
          alert('Código QR no válido.');
        }
      } else {
        alert('No se encontró un código QR.');
      }
    } catch (error) {
      console.error('Error scanning QR code: ', error);
      alert('Error al escanear el código QR.');
    }
  }
  
  // Método para obtener créditos según el código QR
  getCreditosPorCodigo(codigoQR: string): number {
    const codigos: { [key: string]: number } = {
      '8c95def646b6127282ed50454b73240300dccabc': 10,
      'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172': 50,
      '2786f4877b9091dcad7f35751bfcf5d5ea712b2f': 100,
    };

    const cleanCodigoQR = codigoQR.trim().toLowerCase();
    const creditos = codigos[cleanCodigoQR] || 0;
    console.log('Créditos obtenidos: ', creditos);
    return creditos;
  }

  // Método para limpiar los créditos del usuario
  async limpiarCreditos() {
    const user = this.authService.getCurrentUser();
    if (user) {
      await this.authService.limpiarCreditos(user.uid);
      this.creditosAcumulados = 0; // Resetear el visor de créditos
      console.log('Créditos limpiados');
      alert('Créditos limpiados.');
    }
  }
}