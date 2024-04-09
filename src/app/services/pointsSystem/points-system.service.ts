import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PointsSystemService {

  private URL = "http://localhost:8080/api/sistemaPuntos";

  constructor(private httpClient: HttpClient) { }

  public getAllPointsSystem(): Observable<any> {
    return this.httpClient.get(`${this.URL}/getAllPointsSystem`);
  }

  public getSpecificPointsSystem(nombre: string): Observable<any> {
    return this.httpClient.get(`${this.URL}/getSpecificPointsSystem/${nombre}`);
  }

  public getPointsSystemByKeyword(keyword: string): Observable<any> {
    return this.httpClient.get(`${this.URL}/getPointsSystemByKeyword/${keyword}`);
  }

  public addPointsSystem(sistemaPuntos: any): Observable<any> {
    return this.httpClient.post(`${this.URL}/addPointsSystem`, sistemaPuntos);
  }

  public updatePointsSystem(nombre: string, sistemaPuntos: any): Observable<any> {
    return this.httpClient.put(`${this.URL}/updatePointsSystem/${nombre}`, sistemaPuntos);
  }

  public deletePointsSystem(nombre: string): Observable<any> {
    return this.httpClient.delete(`${this.URL}/deletePointsSystem/${nombre}`);
  }
}
