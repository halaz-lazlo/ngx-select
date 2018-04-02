import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgxSelectComponent } from './ngx-select.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    NgxSelectComponent
  ],
  declarations: [
    NgxSelectComponent
  ]
})
export class NgxSelectModule { }
