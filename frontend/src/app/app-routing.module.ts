import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyzeComponent } from './pages/analyze/analyze.component';

const routes: Routes = [
  { path: '', component: AnalyzeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
