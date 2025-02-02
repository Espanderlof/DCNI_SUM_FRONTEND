import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlobFile } from '../interfaces/blob-file.interface';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class BlobService {
  private apiUrl = 'http://172.210.177.28:8085/api/blobs';

  constructor(private http: HttpClient) { }

  getFiles(): Observable<BlobFile[]> {
    return this.http.get<BlobFile[]>(`${this.apiUrl}/list`);
  }

  downloadFile(fileName: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${fileName}`, {
      responseType: 'blob'
    });
  }

  deleteFile(fileName: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${fileName}`);
  }
}