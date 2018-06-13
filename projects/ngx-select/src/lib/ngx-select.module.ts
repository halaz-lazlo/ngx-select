import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxSelectComponent } from './ngx-select.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [NgxSelectComponent],
  exports: [NgxSelectComponent]
})
export class NgxSelectModule { }
