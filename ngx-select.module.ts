import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NxgSelectComponent } from './ngx-select.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    NxgSelectComponent
  ],
  declarations: [
    NxgSelectComponent
  ]
})
export class NgxSelectModule { }
