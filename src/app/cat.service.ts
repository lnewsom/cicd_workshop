import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CATS, NAMES } from './cat-seed';
import { Cat } from './models/cat';
import { NameWithVote } from './models/name-with-vote';

@Injectable({
  providedIn: 'root'
})
export class CatService {
  private readonly currentCat: ReplaySubject<Cat> = new ReplaySubject<Cat>(1);
  private readonly allCats: BehaviorSubject<Cat[]> = new BehaviorSubject<Cat[]>(CATS);
  private readonly allNames: BehaviorSubject<NameWithVote[]> = new BehaviorSubject<NameWithVote[]>(NAMES);
  constructor() { }

  getCurrentCat(): Observable<Cat> {
    return this.currentCat.asObservable();
  }

  updateNames(nameWithVote: NameWithVote, updatedCat: Cat) {
    this.allNames.next([
      ...this.allNames.value,
      nameWithVote
    ]);
    this.updateCurrentCat(updatedCat)
  }

  updateCurrentCat(currentCat: Cat) {
    const allCatsArray = this.allCats.value;

    const updatedAllCats = allCatsArray.map((cat) => {
      if (cat.id === currentCat.id) {
        return {
          ...currentCat
        }
      }
      return {...cat}
    });

    this.allCats.next(updatedAllCats);
    this.currentCat.next(currentCat);
  }

  getAnotherCat(id: string = ''): Observable<Cat> {
    return this.allCats.pipe(
      map((allCats) => {
        if (id) {
          return allCats.find((cat) => cat.id === id) || allCats[0];
        }
        
        const total = allCats.length;

        const randomIndex = this.getRandomIntInclusive(1, total) - 1;

        return allCats[randomIndex];
      }),
      map((cat) => {
        return {
          ...cat,
          names: this.allNames.value.filter((name) => name.catId === cat.id)
        }
      }),
      tap((cat) => this.currentCat.next(cat))
    )
  };

  addACat(image: File): Observable<unknown> {
    return of(image);
  }

  private getRandomIntInclusive(min: number, max: number): number {
    const minCeil = Math.ceil(min);
    const maxFloor = Math.floor(max);
    return Math.floor(Math.random() * (maxFloor - minCeil + 1) + minCeil); //The maximum is inclusive and the minimum is inclusive
  }
}
