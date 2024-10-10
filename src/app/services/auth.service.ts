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
      .then(async (userCredential) => {
        const user: User = userCredential.user;
  
        // Cargar los datos del usuario desde Firestore
        const userData = await this.getUserData(user.uid);
        if (userData) {
          // Aquí puedes emitir los datos que necesitas, como créditos y contadores
          console.log('Usuario autenticado con los siguientes datos:', userData);
          return userData;  // Puedes devolver los datos o hacer algo con ellos en la UI
        } else {
          console.log('No se encontraron datos del usuario en Firestore.');
          return null;  // Return null if no user data is found
        }
      })
      .catch((error) => {
        console.error('Error al iniciar sesión:', error);
        throw error;
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
        const codigosCargados = userData['codigosCargados'] || [];
        const perfil = userData['perfil'] || 'usuario';
        const contadorCreditosAdmin = userData['contadorCreditosAdmin'] || {}; // Objeto para contar por cada código QR
  
        // Verificar cuántas veces se ha cargado el código QR
        const vecesCargado = codigosCargados.filter((codigo: string) => codigo === codigoQR).length;
        const vecesEscaneadoAdmin = contadorCreditosAdmin[codigoQR] || 0; // Veces que el admin ha escaneado este código
  
        // Lógica para perfil admin (máximo 2 veces por código)
        if (perfil === 'admin') {
          if (vecesEscaneadoAdmin >= 2) {
            throw new Error('Este código ya ha sido cargado más de dos veces (admin).');
          }
          // Si no ha llegado al límite, incrementamos el contador específico para este código QR
          await updateDoc(userRef, {
            creditos: userData['creditos'] + credito,
            codigosCargados: arrayUnion(codigoQR),
            contadorCreditosAdmin: {
              ...contadorCreditosAdmin,
              [codigoQR]: vecesEscaneadoAdmin + 1 // Aumentar el contador solo para este código QR
            }
          });
        } else {
          // Lógica para perfil normal (máximo 1 vez por código)
          if (vecesCargado > 0) {
            throw new Error('Este código ya ha sido cargado.');
          }
          // Si el código no ha sido cargado, agregamos crédito
          await updateDoc(userRef, {
            creditos: userData['creditos'] + credito,
            codigosCargados: arrayUnion(codigoQR)
          });
        }
  
        console.log('Créditos agregados correctamente');
      } else {
        throw new Error('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error al agregar créditos:', error);
      throw error;
    }
  }

  async limpiarCreditos(uid: string): Promise<void> {
    const userRef = doc(this.firestore, `usuarios/${uid}`);
    const userDoc = await getDoc(userRef);
  
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const perfil = userData['perfil'] || 'usuario';
  
      const resetData: any = {
        creditos: 0,
        codigosCargados: []
      };
  
      // Si el usuario es admin, también reiniciamos el contador de créditos por código QR
      if (perfil === 'admin') {
        resetData.contadorCreditosAdmin = {}; // Reiniciar los contadores de códigos QR
      }
  
      await updateDoc(userRef, resetData);
      console.log('Créditos limpiados');
    } else {
      throw new Error('Usuario no encontrado');
    }
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