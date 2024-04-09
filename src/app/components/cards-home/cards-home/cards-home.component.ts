import { Component, OnDestroy } from '@angular/core';
import { CardsService } from 'src/app/services/cards/cards.service';
import { ReadingsHistoryService } from 'src/app/services/readingsHistory/readings-history.service';
import { Subscription, interval } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PointsSystemService } from 'src/app/services/pointsSystem/points-system.service';

@Component({
  selector: 'app-cards-home',
  templateUrl: './cards-home.component.html',
  styleUrls: ['./cards-home.component.css']
})
export class CardsHomeComponent implements OnDestroy {

  nombre_usuario = '';
  uid = '';
  puntos = '';
  tarjeta: { uid: string, puntos: number, cliente: { id: number, nombre_usuario: string }, historial_puntos: any[] } = {
    uid: '',
    puntos: 0,
    cliente: {
      id: 0,
      nombre_usuario: ''
    },
    historial_puntos: []
  };

  private intervaloBusqueda: Subscription | undefined;
  buscandoTarjeta = false;
  showModal: { [key: string]: boolean } = {
    guardarTarjeta: false,
    agregarPuntos: false,
    canjearPuntos: false
  };
  formTarjeta: FormGroup;
  seleccionadoAlMenosUno: boolean = false;
  showAlertModal: boolean = false;
  alertMessage: string = '';

  // Modo dios (borrar despues) ----------------------------------------------------------------------
  datosMuestra = {
    tarjeta: {
      uid: 'tarjeta-123',
      puntos: 100,
      cliente: { id: 1, nombre_usuario: 'chokua markez' },
      historial_puntos: [
        { fecha: '2024-04-07', puntos: 50, descripcion: 'Compra de producto A' },
        { fecha: '2024-04-06', puntos: 30, descripcion: 'Compra de producto B' },
        { fecha: '2024-04-05', puntos: 20, descripcion: 'Visita A' }
      ]
    },
    puntosSistemaVisita: [
      { puntos: 10, descripcion: 'Visita A', seleccionado: false },
      { puntos: 30, descripcion: 'Visita B', seleccionado: false }
    ],
    puntosSistemaProducto: [
      { precio: 5, puntos: 10, descripcion: 'Producto A', seleccionado: false },
      { precio: 10, puntos: 20, descripcion: 'Producto B', seleccionado: false }
    ],
    puntosSistemaServicio: [
      { precio: 15, puntos: 30, descripcion: 'Servicio A', seleccionado: false },
      { precio: 20, puntos: 40, descripcion: 'Servicio B', seleccionado: false }
    ],
    puntosSistemaRecompensa: [
      { puntos: 50, descripcion: 'Recompensa A', seleccionado: false },
      { puntos: 100, descripcion: 'Recompensa B', seleccionado: false }
    ]
  };

  modoDiosActivado = false;

  // Modo dios (borrar despues) ----------------------------------------------------------------------

  puntosSistemaVisita: any[] = [{ puntos: 0, descripcion: '', seleccionado: false }];
  puntosSistemaProducto: any[] = [{ precio: 0, puntos: 0, descripcion: '', seleccionado: false }];
  puntosSistemaServicio: any[] = [{ precio: 0, puntos: 0, descripcion: '', seleccionado: false }];
  puntosSistemaRecompensa: any[] = [{ puntos: 0, descripcion: '', seleccionado: false }];
  selectedItems: any[] = [];

  constructor(public fb: FormBuilder,
    private cardsService: CardsService,
    private readingsHistoryService: ReadingsHistoryService,
    private pointsSystemService: PointsSystemService) {
    this.formTarjeta = this.fb.group({
      nombre_usuario: ['', Validators.required]
    });
  }

  buscarTarjeta(): void {
    console.log("Buscando tarjeta...");
    this.buscandoTarjeta = true;
    this.realizarBusqueda();
    this.intervaloBusqueda = interval(5000).subscribe(() => {
      if (!this.buscandoTarjeta) {
        this.intervaloBusqueda?.unsubscribe();
      } else {
        this.realizarBusqueda();
      }
    });
  }

  realizarBusqueda(): void {
    console.log("Obteniendo fecha y hora actual...");
    this.readingsHistoryService.getCurrentServerTime().subscribe(
      (serverDateTime: string) => {
        if (serverDateTime) {
          const formattedDateTime = this.formatDateTime(serverDateTime);
          this.getReadingForDateTime(formattedDateTime);
        }
      },
    );
  }

  formatDateTime(dateTime: string): string {
    return dateTime.split('.')[0];
  }

  getReadingForDateTime(dateTime: string): void {
    this.readingsHistoryService.getCurrentReadingHistory(dateTime).subscribe(
      (tarjeta: any) => {
        if (tarjeta) {
          console.log('Registro de lectura encontrado:', tarjeta);
          const resultado = tarjeta.resultado;
          if (resultado === 'Tarjeta no registrada') {
            this.openModal("guardarTarjeta");
            this.buscandoTarjeta = false;
            this.tarjeta = { uid: tarjeta.uid, puntos: 0, cliente: { id: 0, nombre_usuario: '' }, historial_puntos: [] };
          } else {
            this.uid = tarjeta.uid;
            this.getCardInfo(this.uid);
          }
        }
      }
    );
  }

  // getCardInfo(uid: string): void {
  //   this.cardsService.getSpecificCard(uid).subscribe(
  //     (tarjeta: any) => {
  //       this.nombre_usuario = tarjeta.cliente.nombre_usuario;
  //       this.uid = tarjeta.uid;
  //       this.puntos = tarjeta.puntos;
  //       console.log(`UID de la tarjeta: ${this.uid}, Propietario: ${this.nombre_usuario}`);
  //       this.buscandoTarjeta = false;
  //     },
  //   );
  // }

  // Modo dios (borrar despues) ----------------------------------------------------------------------
  getCardInfo(uid: string): void {
    if (this.modoDiosActivado) {
      // Utilizar datos de muestra en lugar de llamar a la API real
      this.tarjeta = this.datosMuestra.tarjeta;
      this.nombre_usuario = this.tarjeta.cliente.nombre_usuario;
      this.uid = this.tarjeta.uid;
      this.puntos = this.tarjeta.puntos.toString();
      console.log(`UID de la tarjeta: ${this.uid}, Propietario: ${this.nombre_usuario}`);
      this.buscandoTarjeta = false;
    } else {
      // Llamar a la API real
      this.cardsService.getSpecificCard(uid).subscribe(
        (tarjeta: any) => {
          this.nombre_usuario = tarjeta.cliente.nombre_usuario;
          this.uid = tarjeta.uid;
          this.puntos = tarjeta.puntos;
          console.log(`UID de la tarjeta: ${this.uid}, Propietario: ${this.nombre_usuario}`);
          this.buscandoTarjeta = false;
        },
        (error: any) => {
          console.error('Error al obtener la tarjeta:', error);
          this.buscandoTarjeta = false;
        }
      );
    }
  }

  activarModoDios(): void {
    this.modoDiosActivado = true;
    this.getCardInfo(this.uid);
  }

  // Modo dios (borrar despues) ----------------------------------------------------------------------

  // Método para abrir un modal
  openModal(modal: string): void {
    console.log("Abriendo modal...", modal);
    this.showModal[modal] = true;
    this.seleccionadoAlMenosUno = true;
    if (modal === 'agregarPuntos') {
      this.getPointsSystemData('producto');
      this.getPointsSystemData('servicio');
      this.getPointsSystemData('visita');
    } else if (modal === 'canjearPuntos') {
      this.getPointsSystemData('recompensa');
    }
  }

  // Método para cerrar un modal
  closeModal(modal: string): void {
    console.log("Cerrando modal...", modal);
    this.showModal[modal] = false;
    this.limpiarCheckbox();
    this.seleccionadoAlMenosUno = true;
    this.getCardInfo(this.uid);
  }

  // Método para limpiar y establecer en false todos los checkbox al cerrar un modal
  limpiarCheckbox(): void {
    console.log("Limpiando todos los checkbox...");
    this.puntosSistemaVisita.forEach(sistema => sistema.seleccionado = false);
    this.puntosSistemaProducto.forEach(sistema => sistema.seleccionado = false);
    this.puntosSistemaServicio.forEach(sistema => sistema.seleccionado = false);
    this.puntosSistemaRecompensa.forEach(sistema => sistema.seleccionado = false);
  }

  confirmAddCard(): void {
    console.log("Se accionó el metodo 'confirmAddCard'...");
    if (this.formTarjeta.valid) {
      const nombreUsuario = this.formTarjeta.get('nombre_usuario')?.value;

      this.tarjeta.cliente.nombre_usuario = nombreUsuario;

      this.cardsService.addCard(this.tarjeta).subscribe(
        (response: any) => {
          console.log('Tarjeta agregada correctamente:', response);
          this.uid = this.tarjeta.uid;
          this.openAlertModal('¡Tarjeta agregada correctamente!');
          this.closeModal("guardarTarjeta");
        },
        (error: any) => {
          console.error('Error al agregar la tarjeta:', error);
          this.openAlertModal('Error al agregar tarjeta. Por favor, inténtalo de nuevo.');
        }
      );
    }
  }

  terminarBusqueda(): void {
    console.log("Terminando busqueda de tarjeta...");
    this.buscandoTarjeta = false;
  }

  verificarSeleccion(): boolean {
    return this.selectedItems.length > 0;
  }

  // Método para agregar o canjear puntos
  operatePointsCombined(): void {
    this.seleccionadoAlMenosUno = this.verificarSeleccion();
    if (!this.seleccionadoAlMenosUno) {
      // Mostrar un mensaje de error al usuario indicándole que seleccione al menos un checkbox
      return;
    }

    console.log("Se accionó el método 'operatePointsCombined'...");

    let operationType: string = 'agregar';

    // Verificar si hay al menos un sistema de recompensa que requiera canjear puntos
    if (this.puntosSistemaRecompensa.some((sistema: any) => sistema.seleccionado)) {
      operationType = 'canjear';
    }

    // Agrupar sistemas por tipo
    const sistemasPorTipo: { [key: string]: any[] } = {};
    this.puntosSistemaVisita.forEach((sistema: any) => {
      const tipoSistema = sistema.tipo;
      if (!sistemasPorTipo[tipoSistema]) {
        sistemasPorTipo[tipoSistema] = [];
      }
      sistemasPorTipo[tipoSistema].push(sistema);
    });
    this.puntosSistemaProducto.forEach((sistema: any) => {
      const tipoSistema = sistema.tipo;
      if (!sistemasPorTipo[tipoSistema]) {
        sistemasPorTipo[tipoSistema] = [];
      }
      sistemasPorTipo[tipoSistema].push(sistema);
    });
    this.puntosSistemaServicio.forEach((sistema: any) => {
      const tipoSistema = sistema.tipo;
      if (!sistemasPorTipo[tipoSistema]) {
        sistemasPorTipo[tipoSistema] = [];
      }
      sistemasPorTipo[tipoSistema].push(sistema);
    });
    this.puntosSistemaRecompensa.forEach((sistema: any) => {
      const tipoSistema = sistema.tipo;
      if (!sistemasPorTipo[tipoSistema]) {
        sistemasPorTipo[tipoSistema] = [];
      }
      sistemasPorTipo[tipoSistema].push(sistema);
    });

    const tipos = Object.keys(sistemasPorTipo).map(tipo => sistemasPorTipo[tipo]);

    this.operatePointsSequentially(tipos, 0, operationType);
  }

  // Método para agregar o canjear puntos de forma secuencial por tipo
  operatePointsSequentially(sistemasPorTipo: any[], index: number, operationType: string): void {
    if (index < sistemasPorTipo.length) {
      const sistemasTipoActual = sistemasPorTipo[index];
      const tipo = sistemasTipoActual[0].tipo;

      console.log(`Se accionó el método '${operationType}'...`);

      // Filtrar solo los sistemas seleccionados
      const sistemasSeleccionados = sistemasTipoActual.filter((sistema: { seleccionado: any; }) => sistema.seleccionado);
      let puntosTotales = 0;

      if (sistemasSeleccionados.length > 0) {
        console.log(`Sistemas seleccionados:`, sistemasSeleccionados);
      }

      // Definir función recursiva para llamar a los servicios secuencialmente por tipo
      const callServiceSequentially = (index: number) => {
        if (index < sistemasSeleccionados.length) {
          const sistema = sistemasSeleccionados[index];
          console.log(`Puntos: ${sistema.puntos}, Descripción: ${sistema.descripcion}`);

          // Llamar al servicio correspondiente según el tipo de operación
          if (operationType === 'agregar') {
            this.cardsService.addPoints(this.uid, sistema.puntos, sistema.descripcion).subscribe(
              (response: any) => {
                console.log('Puntos agregados correctamente:', response);
                puntosTotales += sistema.puntos;
                const message = `¡Puntos agregados correctamente! Se agregaron un total de ${puntosTotales} puntos.`;
                this.openAlertModal(message);
                // Llamar recursivamente a la siguiente llamada al servicio
                callServiceSequentially(index + 1);
                this.closeModal('agregarPuntos');
              },
              (error: any) => {
                console.error('Error al agregar puntos:', error);
                this.openAlertModal('Error al agregar puntos. Por favor, inténtalo de nuevo.');
                // Llamar recursivamente a la siguiente llamada al servicio
                callServiceSequentially(index + 1);
              }
            );
          } else if (operationType === 'canjear') {
            this.cardsService.redeemPoints(this.uid, sistema.puntos, sistema.descripcion).subscribe(
              (response: any) => {
                console.log('Puntos canjeados correctamente:', response);
                puntosTotales += sistema.puntos;
                const message = `¡Puntos canjeados correctamente! Se canjearon un total de ${puntosTotales} puntos.`;
                this.openAlertModal(message);
                // Llamar recursivamente a la siguiente llamada al servicio
                callServiceSequentially(index + 1);
                this.closeModal('canjearPuntos');
              },
              (error: any) => {
                console.error('Error al canjear puntos:', error);
                this.openAlertModal('Error al canjear puntos, no tienes la cantidad de puntos suficientes.');
                // Llamar recursivamente a la siguiente llamada al servicio
                callServiceSequentially(index + 1);
              }
            );
          }
        } else {
          // Cuando se hayan procesado todas las llamadas para el tipo actual, pasar al siguiente tipo
          this.operatePointsSequentially(sistemasPorTipo, index + 1, operationType);
        }
      };

      // Iniciar llamada al servicio secuencialmente por tipo con el primer índice
      callServiceSequentially(0);
    }
  }

  // Método general para obtener los sistemas de puntos seleccionados
  obtenerSistemasSeleccionadosCombinados(tipo: string): any[] {
    return this.obtenerSistemasSeleccionados(tipo);
  }

  // Método para obtener los sistemas de puntos seleccionados
  obtenerSistemasSeleccionados(_tipo: string): any[] {
    const sistemasSeleccionados: any[] = [];

    const elementosTabla = document.querySelectorAll(`#tablaSistemasPuntos input[type="checkbox"]:checked`);
    elementosTabla.forEach(elemento => {
      const fila = elemento.closest('tr');
      if (fila) {
        const precioElement = fila.querySelector('.precio');
        const precio = precioElement ? parseFloat(precioElement.textContent || '0') : 0;
        const puntosElement = fila.querySelector('.puntos');
        const puntos = puntosElement ? parseFloat(puntosElement.textContent || '0') : 0;
        const descripcion = fila.querySelector('.descripcion')?.textContent;

        sistemasSeleccionados.push({
          precio,
          puntos,
          descripcion
        });
      } else {
        throw new Error('No se encontró la fila');
      }
    });

    return sistemasSeleccionados;
  }

  // Modo dios (borrar despues) ----------------------------------------------------------------------
  getPointsSystemData(keyword: string): void {
    if (this.modoDiosActivado) {
      // Utilizar datos de muestra en lugar de llamar a la API real
      switch (keyword) {
        case 'visita':
          this.puntosSistemaVisita = this.datosMuestra.puntosSistemaVisita;
          break;
        case 'producto':
          this.puntosSistemaProducto = this.datosMuestra.puntosSistemaProducto;
          break;
        case 'servicio':
          this.puntosSistemaServicio = this.datosMuestra.puntosSistemaServicio;
          break;
        case 'recompensa':
          this.puntosSistemaRecompensa = this.datosMuestra.puntosSistemaRecompensa;
          break;
        default:
          console.error('Tipo de puntos desconocido:', keyword);
      }
    } else {
      // Llamar a la API real
      this.pointsSystemService.getPointsSystemByKeyword(keyword).subscribe(
        (data: any[]) => {
          switch (keyword) {
            case 'visita':
              this.puntosSistemaVisita = data.map(item => ({ ...item, seleccionado: false }));
              break;
            case 'producto':
              this.puntosSistemaProducto = data.map(item => ({ ...item, seleccionado: false }));
              break;
            // Otros casos para puntosSistemaServicio, puntosSistemaRecompensa, etc.
            default:
              console.error('Tipo de puntos desconocido:', keyword);
          }
        },
        (error) => {
          console.error('Error al obtener los datos del sistema de puntos:', error);
        }
      );
    }
  }
  // Modo dios (borrar despues) ----------------------------------------------------------------------

  // getPointsSystemData(keyword: string): void {
  //   this.pointsSystemService.getPointsSystemByKeyword(keyword).subscribe(
  //     (data: any[]) => {
  //       switch (keyword) {
  //         case 'visita':
  //           this.puntosSistemaVisita = data.map(item => ({ ...item, seleccionado: false }));
  //           break;
  //         case 'producto':
  //           this.puntosSistemaProducto = data.map(item => ({ ...item, seleccionado: false }));
  //           break;
  //         case 'servicio':
  //           this.puntosSistemaServicio = data.map(item => ({ ...item, seleccionado: false }));
  //           break;
  //         case 'recompensa':
  //           this.puntosSistemaRecompensa = data.map(item => ({ ...item, seleccionado: false }));
  //           break;
  //         default:
  //           console.error('Tipo de puntos desconocido:', keyword);
  //       }
  //     },
  //     (error) => {
  //       console.error('Error al obtener los datos del sistema de puntos:', error);
  //     }
  //   );
  // }

  isSelected(item: any): boolean {
    return this.selectedItems.includes(item);
  }

  toggleSelection(item: any): void {
    if (this.isSelected(item)) {
      this.selectedItems = this.selectedItems.filter(selectedItem => selectedItem.descripcion !== item.descripcion);
      item.seleccionado = false;
      console.log(`El elemento con la descripción: "${item.descripcion}" fue deseleccionado`);
    } else {
      item.seleccionado = true;
      this.selectedItems.push(item);
      console.log(`El elemento con la descripción: "${item.descripcion}" fue seleccionado`);
    }
  }

  openAlertModal(message: string): void {
    this.alertMessage = message;
    this.showAlertModal = true;
  }

  closeAlertModal(): void {
    this.alertMessage = '';
    this.showAlertModal = false;
  }

  ngOnDestroy(): void {
    if (this.intervaloBusqueda) {
      this.intervaloBusqueda.unsubscribe();
    }
  }
}
