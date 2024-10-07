export class Usuario {
    constructor(
        public id: number,
        public nombre: string,
        public email: string,
        public password: string,
        public perfil: string,
        public sexo: string
      ) {}
}
