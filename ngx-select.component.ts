import { Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'ngx-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NxgSelectComponent implements OnInit {
  private _options: object[];
  @Input()
  set options(options: object[]) {
    this._options = options;

    this.filter();
  };
  get options(): object[] {
    return this._options;
  };

  @Input() label?: string;
  @Input() errors?: FormError[];

  @Input() isRequired?: boolean;

  // select input related
  @Input() labelField?: string = 'label';
  @Input() valueField?: string = 'value';
  @Input() allowAdd?: boolean;
  @Input() isMultiple?: boolean;
  @Input() isObjectValue?: boolean;

  @Input() isLoading?: boolean;

  @Input() model: any;
  @Output() modelChange: EventEmitter<any> = new EventEmitter();

  @Output() inputChange: EventEmitter<string> = new EventEmitter();

  @ViewChild('inputDOM') inputDOM: ElementRef;
  @ViewChild('controlDOM') controlDOM: ElementRef;

  public isOpen: boolean;
  public inputWidth: any = 100;
  public highlightedOptionIndex = -1;
  public inputValue: string;

  public filteredOptions: any;
  public selectedOption: any;

  ngOnInit() {
    this.filter();

    window.addEventListener('click', e => {
      if (!this.controlDOM.nativeElement.contains(e.target)){
        this.close();
      }
    });
  }

  focus() {
    this.open();
    this.inputDOM.nativeElement.focus();
  }

  open() {
    if (this.filteredOptions.length || this.inputValue) {
      this.isOpen = true;
    }
  }

  close() {
    this.isOpen = false;
  }

  onInputKeyup() {
    this.open();
    this.filter();

    this.inputChange.emit('asdasd');
  }

  highlightPrevOption() {
    this.open();

    if (this.highlightedOptionIndex <= 0) {
      this.highlightedOptionIndex = this.filteredOptions.length - 1;
    } else {
      this.highlightedOptionIndex -= 1;
    }
  }

  highlightNextOption() {
    this.open();

    if (this.highlightedOptionIndex >= this.filteredOptions.length - 1) {
      this.highlightedOptionIndex = 0;
    } else {
      this.highlightedOptionIndex += 1;
    }
  }

  highlightOption(i) {
    this.highlightedOptionIndex = i;
  }

  onEnter() {
    if (this.allowAdd) {
      if (this.filteredOptions.length > 0) {
        this.selectOption(this.filteredOptions[this.highlightedOptionIndex]);
      } else {
        this.createOption();
      }
    } else {
      this.selectOption(this.filteredOptions[this.highlightedOptionIndex]);
    }
  }

  onBackspace() {
    this.open();

    if (!this.inputValue) {
      if (this.isMultiple) {
        this.removeLastOption();
      } else {
        this.clearAll();
      }
    }
  }

  createOption() {
    if (this.isObjectValue) {
      const newOption = {};
      newOption[this.valueField] = null;
      newOption[this.labelField] = this.inputValue;

      if (!this.isOptionInModel(newOption)) {
        this.selectOption(newOption);
      }
    } else {
      this.selectOption(this.inputValue);
    }
  }

  removeOption(i) {
    this.model.splice(i, 1);

    this.filter();
    this.modelChange.emit(this.model);
  }

  removeLastOption() {
    if (this.model && this.model.length > 0) {
      this.removeOption(this.model.length - 1);
    }
  }

  clearAll() {
    this.selectedOption = null;
    this.model = null;
    this.filter();

    this.modelChange.emit(this.model);
  }

  filter() {
    if (this._options) {
      this.filteredOptions = this._options.filter(option => {
        let isFiltered = !this.inputValue || option[this.labelField].toLowerCase().indexOf(this.inputValue) >= 0;

        // is already selected
        if (this.model && this.isMultiple) {
          if (this.isOptionInModel(option)) {
            isFiltered = false;
          }
        }

        return isFiltered;
      });
    }
  }

  onModelChange(value) {
    this.modelChange.emit(this.model);
  }

  selectOption(option) {
    if (this.isObjectValue) {
      if (this.isMultiple) {
        if (!this.model) {
          this.model = [];
        }

        this.model.push(option);
      }
    } else {
      this.selectedOption = option;
      this.model = option[this.valueField];
    }

    this.highlightedOptionIndex = -1;
    this.inputValue = '';
    this.close();
    this.filter();
    this.modelChange.emit(this.model);
  }

  isOptionInModel(option): boolean {
    let isOptionInModel = false;
    if (this.model) {
      const items = this.model.filter(modelItem => {
        return modelItem[this.labelField] === option[this.labelField];
      });

      isOptionInModel = items.length > 0;
    }

    return isOptionInModel;
  }
}
