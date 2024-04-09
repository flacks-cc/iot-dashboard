import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  private URL = "http://localhost:8080/api/tarjetas";

  constructor(private httpClient: HttpClient) { }

  public getAllCards(): Observable<any> {
    return this.httpClient.get(`${this.URL}/getAllCards`);
  }

  public getSpecificCard(uid: string): Observable<any> {
    return this.httpClient.get(`${this.URL}/getSpecificCard/${uid}`);
  }

  public getCardAndUser(uid: string): Observable<any> {
    return this.httpClient.get(`${this.URL}/getCardAndUser/${uid}`);
  }

  public addCard(tarjeta: any): Observable<any> {
    return this.httpClient.post(`${this.URL}/addCard`, tarjeta);
  }

  public updateCard(uid: string, tarjeta: any): Observable<any> {
    return this.httpClient.put(`${this.URL}/updateCard/${uid}`, tarjeta);
  }

  public deleteCard(uid: string): Observable<any> {
    return this.httpClient.delete(`${this.URL}/deleteCard/${uid}`);
  }

  public addPoints(uid: string, cantidad: number, descripcion: string): Observable<any> {
    const body = { cantidad: cantidad, descripcion: descripcion };
    return this.httpClient.post(`${this.URL}/addPoints/${uid}`, body);
  }

  public redeemPoints(uid: string, cantidad: number, descripcion: string): Observable<any> {
    const body = { cantidad: cantidad, descripcion: descripcion };
    return this.httpClient.post(`${this.URL}/redeemPoints/${uid}`, body);
  }
}