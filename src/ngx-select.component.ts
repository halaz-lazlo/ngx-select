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
  @Input() dropdownDirection?: string = 'down';

  @Input() isLoading?: boolean;

  private _model: any;
  @Input()
  set model(model: any) {
    this._model = model;

    if (!this.isFirstInit) {
      this.initSelectedOption();
    }
  }
  get model() {
    return this._model;
  }
  @Output() modelChange: EventEmitter<any> = new EventEmitter();

  public inputValue: string;
  public inputWidth: number = 0;
  @Output() inputChange: EventEmitter<string> = new EventEmitter();
  @ViewChild('inputDOM') inputDOM: ElementRef;
  @ViewChild('inputFakeDOM') inputFakeDOM: ElementRef;

  @ViewChild('selectDOM') selectDOM: ElementRef;

  public isOpen: boolean;
  public highlightedOptionIndex = -1;

  public filteredOptions: object[];
  public selectedOption: any;
  public selectedOptions: object[] = [];

  private isFirstInit = true;

  ngOnInit() {
    this.filter();

    window.addEventListener('click', e => {
      if (!this.selectDOM.nativeElement.contains(e.target)) {
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

    // set selected
    this.initSelectedOption();

    this.isFirstInit = false;
  }

  initSelectedOption() {
    if (typeof this._model !== 'undefined' && this._model !== null) {
      if (!this.isMultiple) {
        if (this.isObjectValue) {
          this.selectedOption = { ...this._model };
        } else {
          this.selectedOption = this.getOptionByValue(this._model);
        }
      } else {
        if (this.isObjectValue) {
          const selectedOptions = [];
          this._model.forEach(modelItem => {
            selectedOptions.push(modelItem);
          });

          this.selectedOptions = selectedOptions;
        } else {
          const selectedOptions = [];
          this._model.forEach(modelValue => {
            selectedOptions.push(this.getOptionByValue(modelValue));
          });

          this.selectedOptions = selectedOptions;
        }
      }
    }
  }

  focus() {
    this.open();
    this.inputDOM.nativeElement.focus();
  }

  open() {
    if (
      (this.allowAdd && this.inputValue) ||
      ((this.filteredOptions && this.filteredOptions.length) || this.inputValue)
    ) {
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

    if (this.filteredOptions && this.filteredOptions.length > 0) {
      if (this.highlightedOptionIndex >= this.filteredOptions.length - 1) {
        this.highlightedOptionIndex = 0;
      } else {
        this.highlightedOptionIndex += 1;
      }
    }
  }

  highlightOption(i) {
    this.highlightedOptionIndex = i;
  }

  onEnter() {
    if (this.allowAdd) {
      if (this.filteredOptions && this.filteredOptions.length > 0) {
        this.selectOption(this.filteredOptions[this.highlightedOptionIndex]);
      } else {
        this.createOption();
      }
    } else if (this.highlightedOptionIndex >= 0) {
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

    console.log(this.selectedOption, this.selectedOptions);
  }

  createOption() {
    const newOption = {};
    newOption[this.valueField] = null;
    newOption[this.labelField] = this.inputValue;

    if (this.isMultiple) {
      if (!this.isOptionInModel(newOption)) {
        this.selectOption(newOption);
      }
    } else {
      this.selectOption(newOption);
    }
  }

  removeOption(i) {
    this._model.splice(i, 1);
    this.selectedOptions.splice(i, 1);

    this.filter();
    this.modelChange.emit(this._model);
  }

  removeLastOption() {
    if (this._model && this._model.length > 0) {
      this.removeOption(this._model.length - 1);
    }
  }

  clearAll() {
    this._model = null;
    this.selectedOption = null;
    this.selectedOptions = null;
    this.filter();

    this.modelChange.emit(this._model);
  }

  filter() {
    if (this._options) {
      this.filteredOptions = this._options.filter(option => {
        if (option[this.labelField]) {
          let isFiltered = !this.inputValue || option[this.labelField].toLowerCase().indexOf(this.inputValue) >= 0;

          // is already selected
          if (this._model && this.isMultiple) {
            if (this.isOptionInModel(option)) {
              isFiltered = false;
            }
          }

          return isFiltered;
        } else {
          console.error('you sure the labelField is correct?');

          return false;
        }
      });
    }
  }

  selectOption(option) {
    if (this.isMultiple) {
      if (!this._model) {
        this._model = [];
      }

      if (this.isObjectValue) {
        this._model.push(option);
      } else {
        this._model.push(option[this.valueField]);
      }

      this.selectedOptions.push(option);
    } else {
      if (this.isObjectValue) {
        this._model = option;
      } else {
        this._model = option[this.valueField];
      }

      this.selectedOption = option;
    }

    if (!this.isMultiple) {
      this.close();
    }

    this.inputValue = '';
    this.filter();

    this.modelChange.emit(this._model);
  }

  private isOptionInModel(option): boolean {
    let isOptionInModel = false;
    if (this._model) {
      const items = this._model.filter(modelItem => {
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

  private getOptionByValue(value) {
    let ind = null;

    this._options.forEach((option, i) => {
      if (option[this.valueField] === value) {
        ind = i;
      }
    });

    if (ind && ind >= 0) {
      return this._options[ind];
    } else {
      const selectedOption = {};
      selectedOption[this.valueField] = value;
      selectedOption[this.labelField] = value;

      return selectedOption;
    }
  }
}
