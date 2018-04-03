import { Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';

export class AvailableOption {
  constructor(
    public isSelected: boolean,
    public data: any
  ) {}
}

@Component({
  selector: 'ngx-select',
  templateUrl: './ngx-select.component.html',
  encapsulation: ViewEncapsulation.None
})
export class NgxSelectComponent implements OnInit {
  // required
  private _options: object[];
  @Input()
  set options(options: object[]) {
    this._options = options;

    if (!this.isFirstInit) {
      this.updateAvailableOptions();
      this.updateSelectedOptionsWithoutId();
    }
  }
  get options(): object[] {
    return this._options;
  }

  private _model: any;
  @Input()
  set model(model: any) {
    this._model = model;

    if (!this.isFirstInit) {
      this.preloadSelectedOptions();
    }
  }
  get model() {
    return this._model;
  }
  @Output() modelChange: EventEmitter<any> = new EventEmitter();

  // select input related
  @Input() labelField? = 'label';
  @Input() valueField? = 'value';
  @Input() placeholder?: string;
  @Input() isObjectValue?: boolean;
  @Input() isMultiple?: boolean;
  @Input() allowAdd?: boolean;
  @Input() maxItems?: number;
  @Input() isLoading?: boolean;
  @Input() dropdownDirection? = 'down';

  @ViewChild('selectDOM') selectDOM: ElementRef;

  // data helpers
  public availableOptionsMobile: AvailableOption[];
  public availableOptions: AvailableOption[];
  public selectedOptions: object[] = [];

  // input
  public inputValue: string;
  public inputWidth: number;
  @Output() inputChange: EventEmitter<string> = new EventEmitter();
  @ViewChild('inputDOM') inputDOM: ElementRef;
  @ViewChild('inputFakeDOM') inputFakeDOM: ElementRef;

  // messages
  public isOptionAvailable: boolean;
  @Input() noOptionAvailableMsg? = 'No options available, try searching...';

  public isAllOptionSelected: boolean;
  @Input() allOptionSelectedMsg? = 'All options have been selected';

  public isNoFilterResults: boolean;
  public isNoFilterResultsMobile: boolean;
  @Input() noFilterResultsMsg? = 'No results';

  public isAddBtnVisible: boolean;
  @Input() addOptionMsg? = 'Add {{input}}...';
  public addOptionMessage: string;

  // ui
  public isOpen: boolean;
  public highlightedOptionIndex = -1;
  @Output() dropdownOpen: EventEmitter<any> = new EventEmitter();
  @Output() dropdownClose: EventEmitter<any> = new EventEmitter();

  // mobile
  public isMobile: boolean;
  public dropdownOptionsHeight: number;
  @ViewChild('dropdownDOM') dropdownDOM: ElementRef;
  @ViewChild('dropdownBtnsDOM') dropdownBtnsDOM: ElementRef;
  @ViewChild('dropdownInputDOM') dropdownInputDOM: ElementRef;

  // other
  private isFirstInit = true;

  ngOnInit() {
    // init fake input size
    this.initFakeInput();

    this.preloadSelectedOptions();

    this.updateAvailableOptions();

    // click outside
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
      throw new Error('This is a dangerous config, dont use');
    }
  }

  // basic ui

  focus() {
    this.open();

    if (this.inputDOM) {
      this.inputDOM.nativeElement.focus();
    }
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

  // highlighted options

  highlightNextOption() {
    if (this.availableOptions && this.availableOptions.length > 0) {
      if (this.highlightedOptionIndex >= this.availableOptions.length - 1) {
        this.highlightedOptionIndex = 0;
      } else {
        this.highlightedOptionIndex += 1;
      }
    }

    this.open();
  }

  highlightPrevOption() {
    if (this.availableOptions && this.availableOptions.length > 0) {
      if (this.highlightedOptionIndex <= 0) {
        this.highlightedOptionIndex = this.availableOptions.length - 1;
      } else {
        this.highlightedOptionIndex -= 1;
      }
    }

    this.open();
  }

  highlightOption(i) {
    this.highlightedOptionIndex = i;
  }

  // filter

  onInputChange(inputValue) {
    // update input width
    if (this.inputFakeDOM) {
      setTimeout(() => {
        let inputWidth = 0;
        inputWidth = this.inputFakeDOM.nativeElement.clientWidth + 15;

        if (inputWidth === 0) {
          inputWidth = 5;
        }

        this.inputWidth = inputWidth;
      }, 10);
    }

    // update highlighted index
    if (inputValue) {
      this.highlightedOptionIndex = 0;
    }

    this.updateAvailableOptions();

    this.addOptionMessage = this.addOptionMsg.replace('{{input}}', this.inputValue);

    this.open();

    this.inputChange.emit(this.inputValue);
  }

  // select

  preloadSelectedOptions() {
    const selectedOptions = [];

    if (this._model) {
      if (!this.isMultiple) {
        if (this.isObjectValue) {
          selectedOptions.push(this._model);
        } else {
          let selectedOption = this.findOptionByValue(this._model);

          if (!selectedOption) {
            selectedOption = this.createPreloadedSelectedOption(this._model);
          }

          selectedOptions.push(selectedOption);
        }
      } else {
        if (this.isObjectValue) {
          this._model.forEach(modelItem => {
            selectedOptions.push(modelItem);
          });
        } else {
          this._model.forEach(modelValue => {
            let selectedOption = this.findOptionByValue(modelValue);

            if (!selectedOption) {
              selectedOption = this.createPreloadedSelectedOption(modelValue);
            }

            selectedOptions.push(selectedOption);
          });
        }
      }
    }

    this.selectedOptions = selectedOptions;
  }

  createPreloadedSelectedOption(value) {
    const selectedOption = {};
    selectedOption[this.valueField] = value;
    selectedOption[this.labelField] = value;

    return selectedOption;
  }

  selectOption(option) {
    if (!this.isOptionSelected(option)) {
      if (!this.isMultiple) {
        this.selectedOptions = [];
      }

      if (!this.maxItems || this.selectedOptions.length < this.maxItems) {
        this.selectedOptions.push(option);
      }

      this.inputValue = '';

      setTimeout(() => {
        if (!this.isMultiple) {
          this.close();
        }

        this.updateAvailableOptions();
        this.updateModel();
      }, 1);
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

  // remove

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

    setTimeout(() => {
      if (!this.isMultiple) {
        this.close();
      }

      this.updateAvailableOptions();
      this.updateModel();
    }, 1);
  }

  removeLastOption() {
    if (this.selectedOptions.length) {
      this.removeOptionByIndex(this.selectedOptions.length - 1);
    }
  }

  removeAllOption() {
    this.selectedOptions = null;

    this.updateAvailableOptions();
    this.updateModel();
  }

  removeSelectedOption(option) {
    this.selectedOptions.forEach((o, i) => {
      if (o[this.labelField] === option[this.labelField]) {
        this.removeOption(i);
      }
    });
  }

  // key actions

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

  // data helpers

  private updateAvailableOptions() {
    const availableOptions = [];
    const availableOptionsMobile = [];

    if (this._options) {
      this.isOptionAvailable = true;

      // copy _options
      const options = this._options.map(x => Object.assign({}, x));

      // add selected options
      if (this.selectedOptions && this.selectedOptions.length) {
        this.selectedOptions.forEach(selectedOption => {
          if (!this.isOptionInOptions(selectedOption)) {
            options.unshift(selectedOption);
          }
        });
      }

      // filter
      let filteredOptions = options;
      if (this.inputValue) {
        filteredOptions = options.filter(option => {
          if (option[this.labelField]) {
            return !this.inputValue || option[this.labelField].toLowerCase().indexOf(this.inputValue) >= 0;
          } else {
            console.error(`${this.labelField} property doesn't exist on: `, option);

            return false;
          }
        });
      }

      // is in selected
      filteredOptions.forEach(option => {
        const isOptionSelected = this.isOptionSelected(option);
        if (!this.isMultiple || !isOptionSelected) {
          availableOptions.push(new AvailableOption(isOptionSelected, option));
        }

        availableOptionsMobile.push(new AvailableOption(isOptionSelected, option));
      });

      // messages
      this.isAddBtnVisible = false;
      this.isNoFilterResults = false;
      this.isNoFilterResultsMobile = false;
      this.isAllOptionSelected = false;
      this.isOptionAvailable = true;

      if (availableOptions.length === 0) {
        if (this.inputValue && this.inputValue !== '') {
          if (this.allowAdd) {
            const optionToCreate = this.createPreloadedSelectedOption(this.inputValue);
            const isSelected = this.isOptionSelected(optionToCreate);

            if (isSelected) {
              this.isNoFilterResults = true;
            } else {
              this.isAddBtnVisible = true;
            }
          } else {
            this.isNoFilterResults = true;

            if (!availableOptionsMobile.length) {
              this.isNoFilterResultsMobile = true;
            }
          }
        } else {
          if (this.selectedOptions.length === 0) {
            this.isOptionAvailable = false;
          } else {
            this.isAllOptionSelected = true;
          }
        }
      }
    } else {
      this.isOptionAvailable = false;
    }

    this.availableOptions = availableOptions;

    this.availableOptionsMobile = availableOptionsMobile;
  }

  private updateSelectedOptionsWithoutId() {
    if (this.selectedOptions && this.selectedOptions.length) {
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
    let model = null;

    if (this.selectedOptions && this.selectedOptions.length) {
      if (this.isMultiple) {
        model = [];

        this.selectedOptions.forEach(selectedOption => {
          if (this.isObjectValue) {
            model.push(selectedOption);
          } else {
            model.push(selectedOption[this.valueField]);
          }
        });
      } else {
        const selectedOption = this.selectedOptions[0];

        if (this.isObjectValue) {
          model = selectedOption;
        } else {
          model = selectedOption[this.valueField];
        }
      }
    }

    this._model = model;
    this.modelChange.emit(this._model);
  }

  private initFakeInput() {
    if (this.inputDOM) {
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
  }

  private isOptionSelected(option): boolean {
    let isOptionSelected = false;

    if (this.selectedOptions && this.selectedOptions.length) {
      if (this.isMultiple) {
        const isSelected = this.selectedOptions.find(selectedOption => {
          let equals = selectedOption[this.labelField].toLowerCase() === option[this.labelField].toLowerCase();

          if (!this.allowAdd) {
            equals = equals && selectedOption[this.valueField] === option[this.valueField];
          }

          return equals;
        });

        isOptionSelected = !!isSelected;
      } else {
        const selectedOption = this.selectedOptions[0];
        let equals = selectedOption[this.labelField] === option[this.labelField];

        if (!this.allowAdd) {
          equals = equals && selectedOption[this.valueField] === option[this.valueField];
        }

        isOptionSelected = equals;
      }
    }


    return isOptionSelected;
  }

  private isOptionInOptions(option): boolean {
    if (!option[this.valueField]) {
      return false;
    }

    const isOptionInOptions = this._options.find(o => {
      return o[this.valueField] === option[this.valueField];
    });

    return !!isOptionInOptions;
  }

  private findOptionByValue(value) {
    if (this._options) {
      const ind = this._options.findIndex(option => {
        return option[this.valueField] === value;
      });

      if (ind >= 0) {
        return this._options[ind];
      }
    }

    return null;
  }

  private findOptionByLabel(label) {
    if (this._options) {
      const ind = this._options.findIndex(option => {
        return option[this.labelField] === label;
      });

      if (ind >= 0) {
        return this._options[ind];
      }
    }

    return null;
  }

  // Mobile features

  private calculateDropdownOptionsHeight() {
    if (this.dropdownInputDOM) {
      const wrapHeight = this.dropdownDOM.nativeElement.clientHeight;
      const inputHeight = this.dropdownBtnsDOM.nativeElement.clientHeight;
      const btnsHeight = this.dropdownInputDOM.nativeElement.clientHeight;

      this.dropdownOptionsHeight = wrapHeight - (inputHeight + btnsHeight);
    }
  }

  private updateIsMobile() {
    this.isMobile = screen.width < 768;
  }
}
