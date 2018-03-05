import { Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'ngx-select',
  templateUrl: './ngx-select.component.html',
  styleUrls: ['./ngx-select.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NxgSelectComponent implements OnInit {
  private _options: object[];
  @Input()
  set options(options: object[]) {
    this._options = options;

    if (!this.isFirstInit) {
        this.filter();
    }
  };
  get options(): object[] {
    return this._options;
  };

  // select input related
  @Input() labelField?: string = 'label';
  @Input() valueField?: string = 'value';
  @Input() placeholder?: string;
  @Input() allowAdd?: boolean;
  @Input() isMultiple?: boolean;
  @Input() isObjectValue?: boolean;

  @Input() isLoading?: boolean;

  @Input() model: any;
  @Output() modelChange: EventEmitter<any> = new EventEmitter();

  public inputValue: string;
  public inputWidth: number = 0;
  @Output() inputChange: EventEmitter<string> = new EventEmitter();
  @ViewChild('inputDOM') inputDOM: ElementRef;
  @ViewChild('inputFakeDOM') inputFakeDOM: ElementRef;

  @ViewChild('controlDOM') controlDOM: ElementRef;

  public isOpen: boolean;
  public highlightedOptionIndex = -1;

  public filteredOptions: object[];
  public selectedOption: any;
  public selectedOptions: object[] = [];

  private isFirstInit = true;

  ngOnInit() {
    this.filter();

    window.addEventListener('click', e => {
      if (!this.controlDOM.nativeElement.contains(e.target)){
        this.close();
      }
    });

    // copy styles
    const styles = [];
    const cssProps = window.getComputedStyle(this.inputDOM.nativeElement);
    const cssPropsToCopy = ['border', 'line-height', 'letter-spacing', 'font-size', 'font-weight', 'font-family'];
    const newProps = [];
    cssPropsToCopy.forEach(prop => {
      const val = cssProps.getPropertyValue(prop);
      newProps.push(`${prop}: ${val}`);
    });

    this.inputFakeDOM.nativeElement.setAttribute('style', newProps.join(';'));

    this.isFirstInit = false;
  }

  focus() {
    this.open();
    this.inputDOM.nativeElement.focus();
  }

  open() {
    if (this.filteredOptions && (this.filteredOptions.length || this.inputValue)) {
      this.isOpen = true;
    }
  }

  close() {
    this.isOpen = false;
  }

  onInputKeyup() {
    setTimeout(() => {
      let inputWidth = 0;
      inputWidth = this.inputFakeDOM.nativeElement.clientWidth + 15;

      if (inputWidth === 0) {
        inputWidth = 5;
      }

      this.inputWidth = inputWidth;
    }, 10);

    this.open();
    this.filter();

    this.inputChange.emit(this.inputValue);
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
    const newOption = {};
    newOption[this.valueField] = null;
    newOption[this.labelField] = this.inputValue;

    if (!this.isOptionInModel(newOption)) {
      this.selectOption(newOption);
    }
  }

  removeOption(i) {
    this.model.splice(i, 1);
    this.selectedOptions.splice(i, 1);

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
    if (this.isMultiple) {
      if (!this.model) {
          this.model = [];
      }

      if (this.isObjectValue) {
          this.model.push(option);
      } else {
          this.model.push(option[this.valueField]);
      }

      this.selectedOptions.push(option);
    } else {
      if (this.isObjectValue) {
          this.model = option;
      } else {
          this.model = option[this.valueField];
      }

      this.selectedOption = option;
    }

    this.highlightedOptionIndex = -1;
    this.inputValue = '';
    this.close();
    this.filter();
    this.modelChange.emit(this.model);
  }

  private isOptionInModel(option): boolean {
    let isOptionInModel = false;
    if (this.model) {
      const items = this.model.filter(modelItem => {
        if (this.isObjectValue) {
          return modelItem[this.labelField] === option[this.labelField];
        } else {
          return modelItem === option[this.valueField];
        }
      });

      isOptionInModel = items.length > 0;
    }

    return isOptionInModel;
  }
}
