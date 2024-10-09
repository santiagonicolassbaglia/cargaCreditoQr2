import { Injectable, NgZone } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { createUserWithEmailAndPassword, User } from 'firebase/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore'; // Importar Firestore y los métodos necesarios
import { Usuario } from '../clases/usuario'; // Importar la clase Usuario
import { arrayUnion, getDoc, updateDoc } from 'firebase/firestore';

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

  // Guardar los datos del usuario en Firestore
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
      creditos: 0, // Inicializar créditos
      codigosCargados: [], // Guardar los códigos QR que el usuario ha cargado
    });
  }

  // Función para agregar créditos
  async agregarCreditos(uid: string, codigoQR: string, credito: number): Promise<void> {
    try {
        const userRef = doc(this.firestore, `usuarios/${uid}`);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const codigosCargados = userData["codigosCargados"] || [];
            const perfil = userData["perfil"] || 'usuario';  // Suponiendo que el perfil sea 'usuario' o 'admin'

            // Verificar si el código ya fue cargado
            const vecesCargado = codigosCargados.filter((codigo: string) => codigo === codigoQR).length;

            if (vecesCargado > 0) {
                // Si el perfil es "admin", puede cargar hasta dos veces
                if (perfil === 'admin' && vecesCargado < 2) {
                    await updateDoc(userRef, {
                        creditos: userData["creditos"] + credito,
                        codigosCargados: arrayUnion(codigoQR)
                    });
                    console.log('Créditos agregados correctamente (admin, segunda carga)');
                } else if (perfil === 'admin' && vecesCargado >= 2) {
                    throw new Error('Este código ya ha sido cargado más de dos veces (admin).');
                } else {
                    throw new Error('Este código ya ha sido cargado.');
                }
            } else {
                // Agregar el crédito si no está cargado
                await updateDoc(userRef, {
                    creditos: userData["creditos"] + credito,
                    codigosCargados: arrayUnion(codigoQR)
                });
                console.log('Créditos agregados correctamente');
            }
        } else {
            throw new Error('Usuario no encontrado');
        }
    } catch (error) {
        console.error('Error al agregar créditos:', error);
        throw error;
    }
}


  // Función para limpiar los créditos y códigos cargados
  async limpiarCreditos(uid: string): Promise<void> {
    const userRef = doc(this.firestore, `usuarios/${uid}`);
    await updateDoc(userRef, {
      creditos: 0,
      codigosCargados: []
    });
  }

  logout() {
    this.alarmActivated = false;
    return signOut(this.auth);
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  async getUserData(uid: string) {
    const userRef = doc(this.firestore, `usuarios/${uid}`);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error('Usuario no encontrado');
    }
  }
}