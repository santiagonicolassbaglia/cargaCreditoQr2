import { Injectable, NgZone } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { createUserWithEmailAndPassword, User } from 'firebase/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore'; // Importar Firestore y los métodos necesarios
import { Usuario } from '../clases/usuario'; // Importar la clase Usuario

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private alarmActivated: boolean = false;


  constructor(private auth: Auth, private firestore: Firestore, private ngZone: NgZone) {}

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(() => {
        // Si necesitas actualizar el estado de Angular, puedes usar NgZone
        this.ngZone.run(() => {
          console.log('Usuario autenticado');
        });
      });
  }
 
  
  register(email: string, password: string, nombre: string, id: number, perfil: string, sexo: string) {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        const user: User = userCredential.user;
        return this.saveUserData(user.uid, nombre, email, id, perfil, sexo);
      });
  }

  private saveUserData(uid: string, nombre: string, email: string, id: number, perfil: string, sexo: string) {
    const userRef = doc(this.firestore, `usuarios/${uid}`);
    const nuevoUsuario = new Usuario(id, nombre, email, '', perfil, sexo);

    return setDoc(userRef, {
      id: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
      perfil: nuevoUsuario.perfil,
      sexo: nuevoUsuario.sexo,
      createdAt: new Date(),
    });
  }

  logout() {
    this.alarmActivated = false;
    return signOut(this.auth);
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  setAlarmActivated(state: boolean) {
    this.alarmActivated = state;
  }

  isAlarmActivated(): boolean {
    return this.alarmActivated;
  }
}
