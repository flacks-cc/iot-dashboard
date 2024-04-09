import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CardsHomeComponent } from './components/cards-home/cards-home/cards-home.component';

const routes: Routes = [
  {
    path: 'cards-home',
    component: CardsHomeComponent
  },
  {
    path: ' ',
    redirectTo: 'cards-home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'cards-home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
