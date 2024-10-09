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
  constructor(private authService: AuthService) { }

  async scanQrCode() {
    try {
      const result = await BarcodeScanner.scan();
      console.log('Scanned QR result: ', result);

      if (result?.barcodes?.length > 0) {
        const qrContent = result.barcodes[0].displayValue;

        // Aquí definimos los créditos asociados a cada código QR
        const creditos = this.getCreditosPorCodigo(qrContent);

        if (creditos > 0) {
          const user = this.authService.getCurrentUser();
          if (user) {
            await this.authService.agregarCreditos(user.uid, qrContent, creditos);
            console.log(`Créditos acumulados: ${creditos}`);
          }
        } else {
          console.log('Código QR no válido.');
        }
      } else {
        console.log('No QR code found.');
      }
    } catch (error) {
      console.error('Error scanning QR code: ', error);
    }
  }

  getCreditosPorCodigo(codigoQR: string): number {
    const codigos: { [key: string]: number } = {
      '8c95def646b6127282ed50454b73240300dccabc': 10,
      'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172': 50,
      '2786f4877b9091dcad7f35751bfcf5d5ea712b2f': 100,
    };
    return codigos[codigoQR as keyof typeof codigos] || 0;
  }

  async limpiarCreditos() {
    const user = this.authService.getCurrentUser();
    if (user) {
      await this.authService.limpiarCreditos(user.uid);
      console.log('Créditos limpiados');
    }
  }
}