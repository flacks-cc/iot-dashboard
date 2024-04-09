import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReadingsHistoryService {

  private URL = "http://localhost:8080/api/historialLecturas";

  constructor(private httpClient: HttpClient) { }

  public getAllReadingsHistory(): Observable<any> {
    return this.httpClient.get(`${this.URL}/getAllReadingsHistory`);
  }

  public getSpecificReadingHistory(uid: string): Observable<any> {
    return this.httpClient.get(`${this.URL}/getSpecificReadingHistory/${uid}`);
  }

  public getLastReadingHistory(): Observable<any> {
    return this.httpClient.get(`${this.URL}/getLastReadingHistory`);
  }

  public getCurrentReadingHistory(fechaHoraFormateada: string): Observable<any> {
    return this.httpClient.get(`${this.URL}/getCurrentReadingHistory/${fechaHoraFormateada}`);
  }

  public addReadingHistory(lectura: any): Observable<any> {
    return this.httpClient.post(`${this.URL}/addReadingHistory`, lectura);
  }

  public updateReadingHistory(uid: string, lectura: any): Observable<any> {
    return this.httpClient.put(`${this.URL}/updateReadingHistory/${uid}`, lectura);
  }

  public deleteReadingHistory(uid: string): Observable<any> {
    return this.httpClient.delete(`${this.URL}/deleteReadingHistory/${uid}`);
  }

  public getCurrentServerTime(): Observable<any> {
    return this.httpClient.get(`${this.URL}/getCurrentServerTime`);
  }
}
