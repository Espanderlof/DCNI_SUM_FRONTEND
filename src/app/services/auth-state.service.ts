import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserProfile } from './azure-auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  userProfile$ = this.userProfileSubject.asObservable();

  updateUserProfile(profile: UserProfile | null): void {
    this.userProfileSubject.next(profile);
  }

  getCurrentProfile(): UserProfile | null {
    return this.userProfileSubject.getValue();
  }
}