import { Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';

class AvailableOption {
  constructor(
    public isSelected: boolean,
    public data: any
  ) {}
}

@Component({
  selector: 'ngx-select',
  templateUrl: './ngx-select.component.html',
  styleUrls: ['./ngx-select.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NxgSelectComponent implements OnInit {
  // required
  private _options: object[];
  @Input()
  set options(options: object[]) {
    this._options = options;

    if (!this.isFirstInit) {
      this.updateAvailableOptions();
      this.updateAvailableOptionsWithoutId();
    }
  };
  get options(): object[] {
    return this._options;
  };

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

  // select input related
  @Input() labelField?: string = 'label';
  @Input() valueField?: string = 'value';
  @Input() placeholder?: string;
  @Input() isObjectValue?: boolean;
  @Input() isMultiple?: boolean;
  @Input() allowAdd?: boolean;
  @Input() maxItems?: number;
  @Input() isLoading?: boolean;
  @Input() dropdownDirection?: string = 'down';

  // messages
  @Input() noOptionAvailableMsg?: string = 'No options available, try searching...';
  @Input() noFilterResultsMsg?: string = 'No results';
  @Input() allOptionSelectedMsg?: string = 'All options have been selected';
  @Input() addOptionMsg?: string = 'Add {{input}}...';
  public addOptionMessage: string;

  // input
  public inputValue: string;
  public inputWidth: number;
  @Output() inputChange: EventEmitter<string> = new EventEmitter();
  @ViewChild('inputDOM') inputDOM: ElementRef;
  @ViewChild('inputFakeDOM') inputFakeDOM: ElementRef; // just a helper for calculating the input width

  // mobile features
  @ViewChild('dropdownDOM') dropdownDOM: ElementRef;
  @ViewChild('dropdownBtnsDOM') dropdownBtnsDOM: ElementRef;
  @ViewChild('dropdownInputDOM') dropdownInputDOM: ElementRef;
  public dropdownOptionsHeight: number;

  @ViewChild('selectDOM') selectDOM: ElementRef;

  // other events
  @Output() dropdownOpen: EventEmitter<any> = new EventEmitter();
  @Output() dropdownClose: EventEmitter<any> = new EventEmitter();

  // data helpers
  public availableOptionsMobile: AvailableOption[];
  public availableOptions: AvailableOption[];
  public selectedOption: any;
  public selectedOptions: object[] = [];
  public isAllOptionSelected: boolean;
  public isOptionAvailable: boolean;
  private isFirstInit = true;

  // ui helpers
  public isOpen: boolean;
  public highlightedOptionIndex = -1;
  public isAddBtnVisible: boolean;
  public isMobile: boolean;

  private isTouched = false;
  private isDirty = false;

  ngOnInit() {
    // init fake input
    this.initFakeInput();

    // set selected
    this.initSelectedOption();

    // filter options
    this.updateAvailableOptions();

    window.addEventListener('click', e => {
      if (this.isOpen && !this.selectDOM.nativeElement.contains(e.target)) {
        this.close();
      }
    });

    // dropdown height resize
    window.addEventListener('resize', () => {
      if (this.isOpen) {
        this.calculateDropdownOptionsHeight();
        this.updateIsMobile();
      }
    }, true);

    this.isFirstInit = false;

    if (
      this.allowAdd &&
      this.labelField !== this.valueField &&
      this.isMultiple &&
      !this.isObjectValue
    ) {
      console.error('this is a dangerous config');
    }
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
    } else {
      this.selectedOption = null;
    }
  }

  initFakeInput() {
    const styles = [];
    const cssProps = window.getComputedStyle(this.inputDOM.nativeElement);
    const cssPropsToCopy = ['border', 'line-height', 'letter-spacing', 'font-size', 'font-weight', 'font-family'];
    const newProps = [];
    cssPropsToCopy.forEach(prop => {
      const val = cssProps.getPropertyValue(prop);
      newProps.push(`${prop}: ${val}`);
    });

    this.inputFakeDOM.nativeElement.setAttribute('style', newProps.join(';'));
  }

  focus() {
    this.isTouched = true;

    this.open();
    this.inputDOM.nativeElement.focus();
  }

  open() {
    this.isOpen = true;

    if (this.highlightedOptionIndex < 0) {
      this.highlightedOptionIndex = 0;
    }

    setTimeout(() => {
      this.calculateDropdownOptionsHeight();
      this.updateIsMobile();
    }, 1);

    document.body.classList.add('body--ngx-selext-open');

    this.dropdownOpen.emit();
  }

  close() {
    if (this.isOpen) {
      this.isOpen = false;
      this.inputValue = '';

      document.body.classList.remove('body--ngx-selext-open');

      this.dropdownClose.emit();
    }
  }

  onInputChange(inputValue) {
    setTimeout(() => {
      let inputWidth = 0;
      inputWidth = this.inputFakeDOM.nativeElement.clientWidth + 15;

      if (inputWidth === 0) {
        inputWidth = 5;
      }

      this.inputWidth = inputWidth;
    }, 10);

    if (inputValue) {
      this.highlightedOptionIndex = 0;
    } else {
      this.isAddBtnVisible = false;
    }

    this.open();
    this.updateAvailableOptions();

    this.addOptionMessage = this.addOptionMsg.replace('{{input}}', this.inputValue);

    this.inputChange.emit(this.inputValue);
  }

  highlightPrevOption() {
    this.open();

    if (this.highlightedOptionIndex <= 0) {
      this.highlightedOptionIndex = this.availableOptions.length - 1;
    } else {
      this.highlightedOptionIndex -= 1;
    }
  }

  highlightNextOption() {
    this.open();

    if (this.availableOptions && this.availableOptions.length > 0) {
      if (this.highlightedOptionIndex >= this.availableOptions.length - 1) {
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
    const option = this.availableOptions[this.highlightedOptionIndex];

    if (option) {
      this.selectOption(this.availableOptions[this.highlightedOptionIndex].data);
    } else if (this.allowAdd) {
      this.createOption();
    }
  }

  onBackspace() {
    this.open();

    if (!this.inputValue) {
      if (this.isMultiple) {
        this.removeLastOption();
      } else {
        this.removeAllOption();
      }
    }
  }

  createOption() {
    const newOption = {};
    newOption[this.valueField] = null;
    newOption[this.labelField] = this.inputValue;

    setTimeout(() => {
      this.selectOption(newOption);
    }, 1);
  }

  removeOption(i) {
    if (this.isOpen) {
      setTimeout(() => {
        this.removeOptionByIndex(i);
      }, 1);
    } else {
      this.removeOptionByIndex(i);
    }
  }

  removeOptionByIndex(i: number) {
    this.selectedOptions.splice(i, 1);

    this.updateAvailableOptions();
    this.updateModel();
  }

  removeLastOption() {
    if (this.selectedOptions.length) {
      this.removeOptionByIndex(this.selectedOptions.length - 1);
    }
  }

  removeAllOption() {
    this.selectedOption = null;
    this.selectedOptions = null;

    this.updateAvailableOptions();
    this.updateModel();
  }

  removeFilteredOption(option) {
    this.selectedOptions.forEach((o, i) => {
      if (o[this.labelField] === option[this.labelField]) {
        this.removeOption(i);
      }
    });
  }

  selectOption(option) {
    if (!this.isOptionSelected(option)) {
      if (this.isMultiple) {
        if (!this.maxItems || this.selectedOptions.length < this.maxItems) {
          this.selectedOptions.push(option);
        }
      } else {
        this.selectedOption = option;
      }

      this.isDirty = true;
      this.inputValue = '';

      setTimeout(() => {
        this.updateModel();
        this.updateAvailableOptions();

        this.close();
      }, 1);
    }
  }

  private updateAvailableOptions() {
    let isOptionAvailable = true;
    let isAllOptionSelected = true;
    const availableOptions = [];
    const availableOptionsMobile = [];

    if (this._options && this.options.length) {
      // add user added options
      const options = this._options.map(x => Object.assign({}, x));
        if (this.isMultiple && this.selectedOptions) {
          // add options to filtered options
          this.selectedOptions.forEach(selectedOption => {
            const index = options.findIndex(option => {
              return option[this.labelField] === selectedOption[this.labelField];
            });

            if (index < 0) {
              options.unshift(selectedOption);
            }
          });
      }

      // filter options
      const filteredOptions = options.filter(option => {
        if (option[this.labelField]) {
          return !this.inputValue || option[this.labelField].toLowerCase().indexOf(this.inputValue) >= 0;
        } else {
          console.error(`${this.labelField} property doesn't exist on: `, option);

          return false;
        }
      });

      // translate for UI
      filteredOptions.forEach(option => {
        const isOptionSelected = this.isOptionSelected(option);

        if (!this.isMultiple || !isOptionSelected) {
          isAllOptionSelected = false;
          availableOptions.push(new AvailableOption(isOptionSelected, option))
        }

        availableOptionsMobile.push(new AvailableOption(isOptionSelected, option));
      });
    } else {
      isOptionAvailable = false;
      isAllOptionSelected = false;
    }

    this.availableOptions = availableOptions;
    this.availableOptionsMobile = availableOptionsMobile;

    this.isAllOptionSelected = isAllOptionSelected;
    this.isOptionAvailable = isOptionAvailable;
  }

  private isOptionSelected(option): boolean {
    let isOptionSelected = false;

    if (this.selectedOption) {
      if (this.isMultiple) {
        const isSelected = this.selectedOptions.find(selectedOption => {
          let equals = selectedOption[this.labelField] === option[this.labelField];

          if (!this.allowAdd) {
            equals = equals && selectedOption[this.valueField] === option[this.valueField];
          }

          return equals;
        });

        isOptionSelected = !!isSelected;
      } else {
        let equals = this.selectedOption[this.labelField] === option[this.labelField];

        if (!this.allowAdd) {
          equals = equals && this.selectedOption[this.valueField] === option[this.valueField];
        }

        isOptionSelected = equals;
      }
    }

    return isOptionSelected;
  }

  private getOptionByValue(value) {
    const ind = this._options.findIndex(option => {
      return option[this.valueField] === value;
    });

    if (ind >= 0) {
      return this._options[ind];
    } else {
      const selectedOption = {};
      selectedOption[this.valueField] = value;
      selectedOption[this.labelField] = value;

      return selectedOption;
    }
  }

  private updateAvailableOptionsWithoutId() {
    if (this.selectedOptions.length) {
      this.selectedOptions.forEach((selectedOption, i) => {
        // option has no value, must search, maybe options has item with async load
        if (!selectedOption[this.valueField]) {
          this._options.forEach(option => {
            // we have a match
            if (selectedOption[this.labelField].toLowerCase() === option[this.labelField].toLowerCase()) {
              this.selectedOptions[i] = option;
            }
          });
        }
      });

      this.updateAvailableOptions();
      this.updateModel();
    }
  }

  private updateModel() {
    let model;

    if (this.isMultiple) {
      if (this.selectedOptions.length) {
        model = [];

        this.selectedOptions.forEach(selectedOption => {
          if (this.isObjectValue) {
            model.push(selectedOption);
          } else {
            model.push(selectedOption[this.valueField]);
          }
        });
      }
    } else {
      if (this.selectedOption) {
        if (this.isObjectValue) {
          model = this.selectedOption;
        } else {
          model = this.selectedOption[this.valueField];
        }
      }
    }

    this._model = model;

    this.modelChange.emit(this._model);
  }

  // mobile features
  private calculateDropdownOptionsHeight() {
    const wrapHeight = this.dropdownDOM.nativeElement.clientHeight;
    const inputHeight = this.dropdownBtnsDOM.nativeElement.clientHeight;
    const btnsHeight = this.dropdownInputDOM.nativeElement.clientHeight;

    this.dropdownOptionsHeight = wrapHeight - (inputHeight + btnsHeight);
  }

  private updateIsMobile() {
    this.isMobile = screen.width < 768;
  }
}
